


  
    DROP FUNCTION IF EXISTS public.generate_booking_otp(uuid);
    DROP FUNCTION IF EXISTS public.verify_booking_otp(uuid, text);

    -- Create the secure OTP table
    CREATE TABLE IF NOT EXISTS public.booking_secrets (
      booking_id UUID PRIMARY KEY REFERENCES public.bookings(id) ON DELETE CASCADE,
      otp_code TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.booking_secrets ENABLE ROW LEVEL SECURITY;

    -- Drop old policies if they exist to be safe
    DROP POLICY IF EXISTS "Customers can read their booking secrets" ON public.booking_secrets;
    DROP POLICY IF EXISTS "Admins can manage secrets" ON public.booking_secrets;

    -- Customer can read the secret if they own the booking
    CREATE POLICY "Customers can read their booking secrets" 
    ON public.booking_secrets FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.bookings 
        WHERE bookings.id = booking_secrets.booking_id 
        AND bookings.customer_id = auth.uid()
      )
    );

    -- Admin can read/manage all secrets
    CREATE POLICY "Admins can manage secrets" 
    ON public.booking_secrets FOR ALL 
    USING (has_role('admin'));

    -- RPC to generate OTP (Called by Customer or Provider, but OTP is only in booking_secrets)
    CREATE OR REPLACE FUNCTION public.generate_booking_otp(target_booking_id UUID)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      new_otp TEXT;
      b_status TEXT;
    BEGIN
      -- Verify caller has access to the booking (either customer or assigned provider)
      IF NOT EXISTS (
        SELECT 1 FROM bookings 
        WHERE id = target_booking_id 
        AND (customer_id = auth.uid() OR id IN (SELECT booking_id FROM assignments WHERE provider_id = auth.uid()) OR has_role('admin'))
      ) THEN
        RAISE EXCEPTION 'Not authorized';
      END IF;
      
      SELECT status INTO b_status FROM bookings WHERE id = target_booking_id;
      IF b_status != 'accepted' THEN
        RAISE EXCEPTION 'OTP can only be generated for accepted bookings';
      END IF;

      -- Generate 6 digit OTP
      new_otp := floor(random() * (999999 - 100000 + 1) + 100000)::text;

      -- Insert or Update secret
      INSERT INTO booking_secrets (booking_id, otp_code) 
      VALUES (target_booking_id, new_otp)
      ON CONFLICT (booking_id) DO UPDATE SET otp_code = EXCLUDED.otp_code, created_at = NOW();
      
      -- Update bookings table so UI knows an OTP exists, but we store a dummy/masked value!
      -- We will set otp_code in bookings to 'GENERATED' so provider UI knows it exists but doesn't know the value.
      UPDATE bookings SET otp_code = 'GENERATED', otp_expires_at = NOW() + INTERVAL '15 minutes' WHERE id = target_booking_id;
    END;
    $$;

    -- RPC to verify OTP
    CREATE OR REPLACE FUNCTION public.verify_booking_otp(target_booking_id UUID, submitted_otp TEXT)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      real_otp TEXT;
      b_status TEXT;
    BEGIN
      -- Verify caller is assigned provider or admin
      IF NOT EXISTS (
        SELECT 1 FROM assignments WHERE booking_id = target_booking_id AND provider_id = auth.uid()
      ) AND NOT has_role('admin') THEN
        RAISE EXCEPTION 'Not authorized';
      END IF;

      SELECT status INTO b_status FROM bookings WHERE id = target_booking_id;
      IF b_status != 'accepted' THEN
        RAISE EXCEPTION 'Booking is not in accepted state';
      END IF;

      SELECT otp_code INTO real_otp FROM booking_secrets WHERE booking_id = target_booking_id;
      
      IF real_otp IS NULL OR real_otp != submitted_otp THEN
        RAISE EXCEPTION 'Invalid OTP';
      END IF;

      -- Success: Update booking
      UPDATE bookings SET status = 'ongoing', otp_code = 'VERIFIED', otp_verified_at = NOW() WHERE id = target_booking_id;
      
      -- Clean up secret
      DELETE FROM booking_secrets WHERE booking_id = target_booking_id;

      RETURN true;
    END;
    $$;
  

  
  


