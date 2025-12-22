-- Allow users to update their own must_reset_password flag
CREATE POLICY "Users can update own must_reset_password"
ON public.people
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());