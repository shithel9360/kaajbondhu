-- Provider Profiles and Verification

CREATE TYPE provider_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'suspended');

CREATE TABLE public.provider_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nid_number TEXT,
    nid_front_url TEXT,
    nid_back_url TEXT,
    present_address TEXT,
    permanent_address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    status provider_status NOT NULL DEFAULT 'draft',
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER set_provider_profiles_updated_at
    BEFORE UPDATE ON public.provider_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- Provider can read/update their own profile
CREATE POLICY "Providers can read own profile" ON public.provider_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Providers can insert own profile" ON public.provider_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Providers can update own profile" ON public.provider_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can read/update all
CREATE POLICY "Admins can read all provider profiles" ON public.provider_profiles
    FOR SELECT USING (public.has_role('admin'));

CREATE POLICY "Admins can update provider profiles" ON public.provider_profiles
    FOR UPDATE USING (public.has_role('admin'));

-- Provider Skills (Services they offer)
CREATE TABLE public.provider_skills (
    provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    experience_years INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (provider_id, category_id)
);

ALTER TABLE public.provider_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills readable by all" ON public.provider_skills
    FOR SELECT USING (true);

CREATE POLICY "Providers can manage their own skills" ON public.provider_skills
    FOR ALL USING (auth.uid() = provider_id);

-- Secure RPC to submit for approval
CREATE OR REPLACE FUNCTION submit_provider_application()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.provider_profiles
    SET status = 'pending_approval'
    WHERE id = auth.uid() AND status = 'draft';
END;
$$;

-- Secure RPC for admins to approve a provider
CREATE OR REPLACE FUNCTION approve_provider(provider_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.has_role('admin') THEN
        RAISE EXCEPTION 'Only admins can approve providers';
    END IF;

    -- Update status
    UPDATE public.provider_profiles
    SET status = 'approved', approved_at = now(), approved_by = auth.uid()
    WHERE id = provider_uuid;

    -- Upsert role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (provider_uuid, 'provider')
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
