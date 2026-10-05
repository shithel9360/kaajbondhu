-- Add payment information to profiles
ALTER TABLE public.profiles
ADD COLUMN bkash_number TEXT,
ADD COLUMN bank_account_details TEXT;
