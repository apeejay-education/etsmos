-- Drop the existing overly permissive SELECT policy on people table
DROP POLICY IF EXISTS "Authenticated users can view people" ON public.people;

-- Create a new restrictive SELECT policy - only managers and admins can view people
CREATE POLICY "Managers and admins can view people" 
ON public.people 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));