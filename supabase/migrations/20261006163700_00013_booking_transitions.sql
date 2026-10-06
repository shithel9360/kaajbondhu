CREATE OR REPLACE FUNCTION public.enforce_booking_transitions()
RETURNS trigger AS $$
BEGIN
  -- Admins bypass all transition checks
  IF public.has_role('admin') THEN
    RETURN NEW;
  END IF;

  -- If the user is the customer
  IF auth.uid() = OLD.customer_id THEN
    -- Customers can only cancel pending bookings
    IF NEW.status != OLD.status THEN
      IF OLD.status = 'pending' AND NEW.status = 'cancelled' THEN
        -- Allowed
      ELSE
        RAISE EXCEPTION 'Customers can only cancel pending bookings.';
      END IF;
    END IF;
    -- Customers cannot change price or service
    IF NEW.service_id != OLD.service_id THEN
      RAISE EXCEPTION 'Customers cannot change the service of an existing booking.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_enforce_booking_transitions ON public.bookings;
CREATE TRIGGER tr_enforce_booking_transitions
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE PROCEDURE public.enforce_booking_transitions();
