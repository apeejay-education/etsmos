-- Create product_leads table
CREATE TABLE public.product_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(product_id, person_id)
);

-- Enable RLS
ALTER TABLE public.product_leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_leads
CREATE POLICY "Admins can manage product leads"
  ON product_leads FOR ALL 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can manage product leads"
  ON product_leads FOR ALL 
  USING (has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can view own product lead status"
  ON product_leads FOR SELECT 
  USING (person_id = get_current_person_id());

-- Create helper function to check if user is product lead
CREATE OR REPLACE FUNCTION public.is_product_lead(_product_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.product_leads pl
    JOIN public.people p ON p.id = pl.person_id
    WHERE pl.product_id = _product_id AND p.user_id = _user_id
  )
$$;

-- Add RLS policy for product leads to create initiatives
CREATE POLICY "Product leads can create initiatives"
  ON initiatives FOR INSERT
  WITH CHECK (is_product_lead(product_id, auth.uid()));

-- Add RLS policy for product leads to update their product's initiatives
CREATE POLICY "Product leads can update their product initiatives"
  ON initiatives FOR UPDATE
  USING (is_product_lead(product_id, auth.uid()));