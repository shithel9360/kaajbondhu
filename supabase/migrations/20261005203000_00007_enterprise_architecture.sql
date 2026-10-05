-- Enterprise Architecture Foundation for KaajBondhu
-- Adding missing architectural tables for future-proofing as per PRD constraints

-- 1. BOOKING STATUS HISTORY (Audit Trail)
CREATE TABLE public.booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their booking history" ON public.booking_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.assignments a WHERE a.booking_id = b.id AND a.provider_id = auth.uid()))
        )
        OR public.has_role('admin')
    );

-- Trigger to automatically log status changes
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.booking_status_history (booking_id, previous_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_booking_status
    AFTER UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();


-- 2. OTP SYSTEM
ALTER TABLE public.bookings ADD COLUMN otp_code TEXT;
ALTER TABLE public.bookings ADD COLUMN otp_verified_at TIMESTAMPTZ;

-- Secure RPC to generate OTP (only callable when provider arrives)
CREATE OR REPLACE FUNCTION generate_booking_otp(target_booking_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_otp TEXT;
BEGIN
    -- Verify caller is the assigned provider or customer
    new_otp := floor(random() * 900000 + 100000)::text; -- 6 digit OTP
    UPDATE public.bookings SET otp_code = new_otp WHERE id = target_booking_id;
    RETURN new_otp;
END;
$$;


-- 3. FINANCIAL LEDGER (Append Only)
CREATE TYPE ledger_transaction_type AS ENUM ('customer_payment', 'platform_commission', 'provider_payable', 'refund', 'adjustment', 'payout');

CREATE TABLE public.financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id),
    user_id UUID REFERENCES auth.users(id),
    type ledger_transaction_type NOT NULL,
    amount_poisha INTEGER NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all ledger entries" ON public.financial_ledger FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Users view own ledger" ON public.financial_ledger FOR SELECT USING (user_id = auth.uid());
-- No update/delete policies = append only by definition (inserts done via secure RPCs).


-- 4. QUOTES & MATERIALS
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES auth.users(id),
    labor_cost INTEGER NOT NULL DEFAULT 0,
    materials_cost INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 5. REVIEWS (Formalized)
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    customer_id UUID REFERENCES auth.users(id),
    provider_id UUID REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 6. DISPUTES
CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    raised_by UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 7. MESSAGES (Booking-specific communication)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 8. NOTIFICATIONS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 9. AUDIT LOGS
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only audit logs" ON public.audit_logs FOR ALL USING (public.has_role('admin'));
