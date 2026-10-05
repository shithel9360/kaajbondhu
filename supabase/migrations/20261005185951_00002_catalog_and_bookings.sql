-- KaajBondhu Catalog & Bookings Schema (Phase 3)

-- 1. CATALOG (Categories & Services)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    archived_at TIMESTAMPTZ
);

CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    pricing_model TEXT NOT NULL DEFAULT 'fixed', -- fixed, hourly, starting_at
    base_price INTEGER NOT NULL DEFAULT 0, -- stored in poisha (minor units)
    visit_fee INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    archived_at TIMESTAMPTZ
);

-- Triggers for updated_at
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS for Catalog
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are readable by everyone" ON public.categories FOR SELECT USING (archived_at IS NULL);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role('admin'));

CREATE POLICY "Services are readable by everyone" ON public.services FOR SELECT USING (archived_at IS NULL);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.has_role('admin'));


-- 2. BOOKINGS
CREATE TYPE booking_status AS ENUM (
    'draft', 'pending', 'matching', 'provider_selected', 'accepted', 'confirmed', 
    'provider_on_the_way', 'arrived', 'otp_pending', 'otp_verified', 'in_progress', 
    'awaiting_material_approval', 'completed', 'payment_pending', 'paid', 'review_pending', 
    'closed', 'cancelled', 'unmatched', 'rescheduled', 'disputed'
);

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    status booking_status NOT NULL DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    address TEXT,
    coordinates JSONB,
    total_price INTEGER, -- poisha
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Customers can view their own bookings
CREATE POLICY "Customers view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Admins can view all
CREATE POLICY "Admins view all bookings" ON public.bookings FOR SELECT USING (public.has_role('admin'));

-- 3. ASSIGNMENTS
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'offered', -- offered, accepted, rejected, cancelled
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(booking_id, provider_id)
);

CREATE TRIGGER set_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers view own assignments" ON public.assignments FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Customers view assignments for their bookings" ON public.assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.customer_id = auth.uid())
);
