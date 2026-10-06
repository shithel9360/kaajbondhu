-- Create helper function to bypass RLS recursion safely
CREATE OR REPLACE FUNCTION public.check_booking_customer(b_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = b_id AND customer_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update assignments policy to use the helper instead of a direct subquery that triggers recursion
DROP POLICY IF EXISTS "Customers view assignments for their bookings" ON public.assignments;
CREATE POLICY "Customers view assignments for their bookings"
ON public.assignments FOR SELECT
USING (
  public.has_role('customer') AND public.check_booking_customer(booking_id)
);
