-- KaajBondhu Core Schema & Security (Phase 2)

-- 1. UTILITY FUNCTIONS (Timestamps)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. ROLES & PERMISSIONS
-- Store roles in a separate table, not editable on profiles.
CREATE TYPE app_role AS ENUM ('customer', 'provider', 'admin');
CREATE TYPE admin_sub_role AS ENUM ('super_admin', 'operations', 'support', 'finance', 'verifier');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    sub_role admin_sub_role,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security Definer helper for roles
CREATE OR REPLACE FUNCTION public.has_role(check_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = check_role
  );
$$;

-- RLS Policy: Users can read their own roles. Admins can read all.
CREATE POLICY "Users can read own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin'));

-- Only admins can insert/update roles (except for initial customer/provider creation which will be handled via secure RPC or triggers)
CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role('admin'));

-- 3. PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    archived_at TIMESTAMPTZ
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone." 
    ON public.profiles FOR SELECT 
    USING (archived_at IS NULL);

CREATE POLICY "Users can insert their own profile." 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id AND archived_at IS NULL);

-- 4. MARKETS & LOCATIONS (Foundation for catalog & pricing)
CREATE TABLE public.markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'BDT',
    timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_markets_updated_at
    BEFORE UPDATE ON public.markets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE POLICY "Markets are readable by everyone" 
    ON public.markets FOR SELECT USING (true);

-- 5. SECURE AUTO-ROLE ASSIGNMENT (TRIGGER)
-- When a user signs up, automatically create a profile.
-- Role assignment will be done explicitly via RPC, but let's default to customer.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  
  -- Default to customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
