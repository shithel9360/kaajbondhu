-- Migration: 00009_production_hardening.sql
-- Purpose: Dynamic configuration, Storage Security, Payment Webhook Idempotency

BEGIN;

-- 1. Platform Settings for Dynamic Commission
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- RLS for Platform Settings (Admin read/write, public read for relevant configs)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings" 
ON public.platform_settings FOR SELECT 
USING (true);

CREATE POLICY "Admins can update platform settings" 
ON public.platform_settings FOR ALL 
USING (public.has_role('admin'));

-- Insert default commission (10%)
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES ('commission_percentage', '10', 'Default platform commission percentage applied to completed bookings.')
ON CONFLICT (setting_key) DO NOTHING;


-- 2. Secure Storage Bucket: provider_kyc
-- We must insert into storage.buckets if it does not exist, setting public to FALSE
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider_kyc', 'provider_kyc', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Providers can upload their own KYC" ON storage.objects;
DROP POLICY IF EXISTS "Providers can view their own KYC" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all KYC" ON storage.objects;

-- RLS on storage.objects for provider_kyc
CREATE POLICY "Providers can upload their own KYC"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'provider_kyc' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Providers can view their own KYC"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'provider_kyc' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all KYC"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'provider_kyc' AND public.has_role('admin'));


-- 3. Payment Webhook Idempotency Table
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT UNIQUE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id),
    status TEXT NOT NULL,
    amount_poisha INTEGER NOT NULL,
    raw_payload JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
-- No public access. Only Edge Functions (Service Role) can write. Admins can read.
CREATE POLICY "Admins can view payment events" 
ON public.payment_events FOR SELECT 
USING (public.has_role('admin'));


-- 4. Update complete_booking RPC to use dynamic commission
CREATE OR REPLACE FUNCTION complete_booking(target_booking_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    booking_record RECORD;
    commission_pct INTEGER;
    calculated_platform_fee INTEGER;
    calculated_provider_amount INTEGER;
BEGIN
    -- Ensure caller is the assigned provider
    IF NOT EXISTS (SELECT 1 FROM public.assignments WHERE booking_id = target_booking_id AND provider_id = auth.uid()) THEN
        RAISE EXCEPTION 'Unauthorized.';
    END IF;

    SELECT * INTO booking_record FROM public.bookings WHERE id = target_booking_id FOR UPDATE;

    IF booking_record.status != 'ongoing' THEN
        RAISE EXCEPTION 'Booking must be ongoing to complete.';
    END IF;

    -- Fetch dynamic commission from platform_settings
    SELECT (setting_value::text)::integer INTO commission_pct 
    FROM public.platform_settings 
    WHERE setting_key = 'commission_percentage';

    IF commission_pct IS NULL THEN
        commission_pct := 10; -- Fallback safety
    END IF;

    -- Calculate Fee Safely Server-Side
    calculated_platform_fee := (booking_record.total_price * commission_pct) / 100;
    calculated_provider_amount := booking_record.total_price - calculated_platform_fee;

    -- Update booking status
    UPDATE public.bookings 
    SET status = 'completed', updated_at = NOW()
    WHERE id = target_booking_id;

    -- Insert into financial ledger (Append-Only)
    INSERT INTO public.financial_ledger (booking_id, type, amount_poisha, reference_id, description)
    VALUES 
    (target_booking_id, 'platform_commission', calculated_platform_fee, NULL, 'Platform fee (' || commission_pct || '%)'),
    (target_booking_id, 'provider_payout_pending', calculated_provider_amount, NULL, 'Provider earnings pending payout');

    RETURN TRUE;
END;
$$;

COMMIT;
