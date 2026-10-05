-- Add location coordinates to bookings

ALTER TABLE public.bookings
ADD COLUMN lat NUMERIC,
ADD COLUMN lng NUMERIC;
