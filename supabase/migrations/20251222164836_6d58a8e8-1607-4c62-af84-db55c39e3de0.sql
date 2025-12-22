-- Drop the existing insert policy
DROP POLICY IF EXISTS "Tagged users can insert initiative chats" ON public.initiative_chats;

-- Create new insert policy that allows tagged users AND admins/managers
CREATE POLICY "Tagged users and managers can insert initiative chats"
ON public.initiative_chats
FOR INSERT
WITH CHECK (
  -- Must have a valid person_id that matches current user
  person_id = public.get_current_person_id()
  AND (
    -- Either tagged in the initiative
    EXISTS (
      SELECT 1 FROM public.contributions c
      WHERE c.initiative_id = initiative_chats.initiative_id
      AND c.person_id = initiative_chats.person_id
    )
    -- Or is admin/manager
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);