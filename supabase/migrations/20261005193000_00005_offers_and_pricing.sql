-- Migration to add discount/offers and realistic BD market pricing

ALTER TABLE public.services 
ADD COLUMN discount_percentage INTEGER NOT NULL DEFAULT 0;

-- Realistic BD Market Pricing (Slightly lower than competitors like Sheba.xyz)
-- Stored in poisha (1 BDT = 100 Poisha)

-- 1. AC Basic Cleaning (Competitor ~500 BDT, KaajBondhu = 450 BDT)
UPDATE public.services 
SET base_price = 45000, 
    visit_fee = 0,
    discount_percentage = 10,
    description = '১-২ টন এসির সাধারণ ক্লিনিং। দক্ষ টেকনিশিয়ান দ্বারা সার্ভিস। (১০% ছাড়ে)'
WHERE id = '44444444-4444-4444-4444-444444444444';

-- 2. AC Gas Refill (Competitor ~1500 BDT, KaajBondhu = 1400 BDT)
UPDATE public.services 
SET base_price = 140000, 
    visit_fee = 10000,
    discount_percentage = 0,
    description = 'গ্যাস লিক চেক, প্রেশার মেইনটেইন এবং রিফিল।'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- 3. Plumbing (Competitor ~300 BDT, KaajBondhu = 250 BDT)
UPDATE public.services 
SET base_price = 25000, 
    visit_fee = 5000,
    discount_percentage = 0,
    description = 'যেকোনো পানির কল, সিংক বা বেসিন মেরামত।'
WHERE id = '66666666-6666-6666-6666-666666666666';

-- 4. Deep Cleaning (Competitor ~3500 BDT, KaajBondhu = 2999 BDT)
UPDATE public.services 
SET base_price = 299900, 
    visit_fee = 0,
    discount_percentage = 15,
    description = '৩ বেডরুমের বাসা সম্পূর্ণ ক্লিনিং। বাথরুম, কিচেন এবং ফ্লোর ডিপ ক্লিন। (১৫% বিশেষ ছাড়!)'
WHERE id = '77777777-7777-7777-7777-777777777777';

-- Insert a new bundle offer service
INSERT INTO public.services (id, category_id, name, description, base_price, visit_fee, pricing_model, discount_percentage) 
VALUES 
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'এসি মাস্টার বান্ডেল (২টি এসি)', 'একসাথে ২টি এসির ফুল সার্ভিসিং ও ক্লিনিং। ২য় এসিতে ৫০% ছাড়!', 75000, 0, 'fixed', 20)
ON CONFLICT DO NOTHING;
