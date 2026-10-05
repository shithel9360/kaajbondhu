-- Migration 00008: Strict PRD Compliance, Atomic Concurrency, and Security Hardening

-- 1. SECURITY DEFINER FIXES (search_path)
ALTER FUNCTION public.has_role(app_role) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.submit_provider_application() SET search_path = public;
ALTER FUNCTION public.approve_provider(UUID) SET search_path = public;
ALTER FUNCTION public.log_booking_status_change() SET search_path = public;

-- 2. BOOKING LIFECYCLE & PAYMENT STATUS SEPARATION

-- Map old statuses to new PRD statuses
UPDATE public.bookings SET status = 'pending' WHERE status = 'payment_pending';
UPDATE public.bookings SET status = 'completed' WHERE status = 'paid';
UPDATE public.bookings SET status = 'completed' WHERE status = 'review_pending';
UPDATE public.bookings SET status = 'completed' WHERE status = 'closed';
UPDATE public.bookings SET status = 'ongoing' WHERE status = 'in_progress';
UPDATE public.bookings SET status = 'accepted' WHERE status = 'provider_selected';

-- Add explicit payment status
CREATE TYPE payment_status_type AS ENUM ('pending', 'authorized', 'paid', 'failed', 'refunded');
ALTER TABLE public.bookings ADD COLUMN payment_status payment_status_type NOT NULL DEFAULT 'pending';

-- Add financial calculation locks
ALTER TABLE public.bookings ADD COLUMN platform_fee INTEGER DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN provider_amount INTEGER DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN commission_rate_used INTEGER DEFAULT 0; -- e.g., 10 for 10%

-- 3. PROVIDER PRIVACY & RLS
-- Providers should only see the exact address if they have accepted the booking.
-- We will handle this by hiding it in the UI based on assignment, but ideally via a database view.
-- For now, MVP RLS isolates bookings.

-- 4. ATOMIC PROVIDER ACCEPTANCE (Concurrency control)
CREATE OR REPLACE FUNCTION accept_booking(target_booking_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_status TEXT;
BEGIN
    -- 1. Check if caller is provider
    IF NOT public.has_role('provider') THEN
        RAISE EXCEPTION 'Only verified providers can accept bookings.';
    END IF;

    -- 2. Lock the booking row for update to prevent race conditions
    SELECT status INTO current_status
    FROM public.bookings
    WHERE id = target_booking_id
    FOR UPDATE;

    -- 3. Check if it is still pending/matching
    IF current_status NOT IN ('pending', 'matching') THEN
        RAISE EXCEPTION 'Booking is no longer available.';
    END IF;

    -- 4. Update status and insert assignment atomically
    UPDATE public.bookings
    SET status = 'accepted'
    WHERE id = target_booking_id;

    INSERT INTO public.assignments (booking_id, provider_id, status)
    VALUES (target_booking_id, auth.uid(), 'accepted');

    RETURN TRUE;
END;
$$;

-- 5. SECURE OTP GENERATION (4-digit, expiring)
ALTER TABLE public.bookings ADD COLUMN otp_expires_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION generate_booking_otp(target_booking_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_otp TEXT;
    is_assigned BOOLEAN;
BEGIN
    -- Verify caller is the assigned provider
    SELECT EXISTS (
        SELECT 1 FROM public.assignments 
        WHERE booking_id = target_booking_id AND provider_id = auth.uid()
    ) INTO is_assigned;

    IF NOT is_assigned THEN
        RAISE EXCEPTION 'Unauthorized to generate OTP for this booking.';
    END IF;

    -- Generate 4-digit OTP
    new_otp := floor(random() * 9000 + 1000)::text; 
    
    UPDATE public.bookings 
    SET otp_code = new_otp, 
        otp_expires_at = now() + interval '15 minutes' 
    WHERE id = target_booking_id;
    
    RETURN new_otp;
END;
$$;

-- 6. SECURE OTP VERIFICATION
CREATE OR REPLACE FUNCTION verify_booking_otp(target_booking_id UUID, submitted_otp TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    valid_otp TEXT;
    expiry TIMESTAMPTZ;
BEGIN
    SELECT otp_code, otp_expires_at INTO valid_otp, expiry
    FROM public.bookings
    WHERE id = target_booking_id;

    IF valid_otp IS NULL THEN
        RAISE EXCEPTION 'No OTP generated.';
    END IF;

    IF now() > expiry THEN
        RAISE EXCEPTION 'OTP expired.';
    END IF;

    IF valid_otp != submitted_otp THEN
        RAISE EXCEPTION 'Invalid OTP.';
    END IF;

    -- OTP matched, set booking to ongoing
    UPDATE public.bookings 
    SET status = 'ongoing', 
        otp_verified_at = now(),
        otp_code = NULL -- single use
    WHERE id = target_booking_id;

    RETURN TRUE;
END;
$$;

-- 7. COMPLETE BOOKING & CALCULATE FEES (Server-side financial calculation)
CREATE OR REPLACE FUNCTION complete_booking(target_booking_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    booking_record RECORD;
    commission_pct INTEGER := 10; -- Dynamic commission rule (10% for MVP)
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

    -- Calculate fees securely on server
    calculated_platform_fee := (booking_record.total_price * commission_pct) / 100;
    calculated_provider_amount := booking_record.total_price - calculated_platform_fee;

    -- Update booking
    UPDATE public.bookings
    SET status = 'completed',
        platform_fee = calculated_platform_fee,
        provider_amount = calculated_provider_amount,
        commission_rate_used = commission_pct
    WHERE id = target_booking_id;

    -- Insert into immutable ledger
    INSERT INTO public.financial_ledger (booking_id, user_id, type, amount_poisha)
    VALUES 
        (target_booking_id, auth.uid(), 'provider_payable', calculated_provider_amount),
        (target_booking_id, NULL, 'platform_commission', calculated_platform_fee);

    RETURN TRUE;
END;
$$;
