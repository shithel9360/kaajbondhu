-- Allow verified providers to view all pending bookings
CREATE POLICY "Providers view pending bookings" ON public.bookings 
FOR SELECT 
USING (
    status = 'pending' AND 
    public.has_role('provider')
);

-- Allow providers to view bookings assigned to them
CREATE POLICY "Providers view their own assigned bookings" ON public.bookings 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.assignments a 
        WHERE a.booking_id = id AND a.provider_id = auth.uid()
    )
);

-- Allow providers to accept bookings (update status to accepted)
CREATE POLICY "Providers accept bookings" ON public.bookings
FOR UPDATE
USING (
    public.has_role('provider') AND status = 'pending'
);

-- Allow providers to update their own assigned bookings (e.g. mark as completed)
CREATE POLICY "Providers update assigned bookings" ON public.bookings
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.assignments a 
        WHERE a.booking_id = id AND a.provider_id = auth.uid()
    )
);

-- Allow providers to insert into assignments (accepting a job)
CREATE POLICY "Providers create assignments" ON public.assignments
FOR INSERT
WITH CHECK (
    auth.uid() = provider_id AND public.has_role('provider')
);
