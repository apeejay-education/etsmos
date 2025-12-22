-- Allow logged-in users to view their own person record (needed for personal dashboard + forced password reset)
CREATE POLICY "Users can view own person record"
ON public.people
FOR SELECT
USING (user_id = auth.uid());
