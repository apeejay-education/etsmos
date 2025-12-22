-- Create initiative_chats table for messaging within initiatives
CREATE TABLE public.initiative_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.initiative_chats ENABLE ROW LEVEL SECURITY;

-- Policy: Users tagged in an initiative can read chat messages
CREATE POLICY "Tagged users can read initiative chats"
ON public.initiative_chats
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contributions c
    JOIN public.people p ON p.id = c.person_id
    WHERE c.initiative_id = initiative_chats.initiative_id
    AND p.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

-- Policy: Tagged users can insert chat messages (only for their own person_id)
CREATE POLICY "Tagged users can insert initiative chats"
ON public.initiative_chats
FOR INSERT
WITH CHECK (
  person_id = public.get_current_person_id()
  AND EXISTS (
    SELECT 1 FROM public.contributions c
    WHERE c.initiative_id = initiative_chats.initiative_id
    AND c.person_id = initiative_chats.person_id
  )
);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own chat messages"
ON public.initiative_chats
FOR DELETE
USING (person_id = public.get_current_person_id());

-- Create function to check if user is a lead on an initiative
CREATE OR REPLACE FUNCTION public.is_initiative_lead(_initiative_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contributions c
    JOIN public.people p ON p.id = c.person_id
    WHERE c.initiative_id = _initiative_id
    AND p.user_id = _user_id
    AND c.contribution_role = 'lead'
  )
$$;

-- Update initiative RLS to allow leads to update
CREATE POLICY "Initiative leads can update their initiatives"
ON public.initiatives
FOR UPDATE
USING (public.is_initiative_lead(id, auth.uid()));

-- Enable realtime for initiative_chats
ALTER PUBLICATION supabase_realtime ADD TABLE public.initiative_chats;