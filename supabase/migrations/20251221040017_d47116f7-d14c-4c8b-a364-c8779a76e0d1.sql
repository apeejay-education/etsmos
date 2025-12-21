-- Add tentative_delivery_date column to initiatives table
ALTER TABLE public.initiatives 
ADD COLUMN tentative_delivery_date date;