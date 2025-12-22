-- Add user_id to people table to link with auth.users
ALTER TABLE public.people 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- Add must_reset_password flag to track first login requirement
ALTER TABLE public.people
ADD COLUMN must_reset_password boolean NOT NULL DEFAULT false;

-- Create index for faster lookups
CREATE INDEX idx_people_user_id ON public.people(user_id);

-- Function to get person_id for current user
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.people
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Function to check if user has access to an initiative (via contributions)
CREATE OR REPLACE FUNCTION public.user_has_initiative_access(_user_id uuid, _initiative_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contributions c
    JOIN public.people p ON p.id = c.person_id
    WHERE p.user_id = _user_id AND c.initiative_id = _initiative_id
  )
$$;

-- Function to check if user has access to a product (via initiative contributions)
CREATE OR REPLACE FUNCTION public.user_has_product_access(_user_id uuid, _product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contributions c
    JOIN public.initiatives i ON i.id = c.initiative_id
    JOIN public.people p ON p.id = c.person_id
    WHERE p.user_id = _user_id AND i.product_id = _product_id
  )
$$;

-- Update initiatives RLS: viewers see only their tagged initiatives
DROP POLICY IF EXISTS "Authenticated users can view initiatives" ON public.initiatives;
CREATE POLICY "Users can view their initiatives or managers see all"
ON public.initiatives
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
  OR user_has_initiative_access(auth.uid(), id)
);

-- Update products RLS: viewers see only products with their initiatives
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
CREATE POLICY "Users can view their products or managers see all"
ON public.products
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
  OR user_has_product_access(auth.uid(), id)
);

-- Update contributions RLS: users can view their own contributions
DROP POLICY IF EXISTS "Authenticated users can view contributions" ON public.contributions;
CREATE POLICY "Users can view own contributions or managers see all"
ON public.contributions
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
  OR person_id = get_current_person_id()
);

-- Allow users to update their own contribution_summary only
CREATE POLICY "Users can update own contribution summary"
ON public.contributions
FOR UPDATE
USING (person_id = get_current_person_id())
WITH CHECK (person_id = get_current_person_id());

-- Update execution_signals RLS: users can view signals for their initiatives
DROP POLICY IF EXISTS "Authenticated users can view signals" ON public.execution_signals;
CREATE POLICY "Users can view their signals or managers see all"
ON public.execution_signals
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
  OR user_has_initiative_access(auth.uid(), initiative_id)
);