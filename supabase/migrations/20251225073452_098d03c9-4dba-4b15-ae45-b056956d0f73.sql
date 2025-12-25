-- Create enums for initiative updates
CREATE TYPE public.update_type AS ENUM ('update', 'review', 'closure', 'comment');
CREATE TYPE public.update_status AS ENUM ('open', 'completed', 'blocked');

-- Create initiative_updates table
CREATE TABLE public.initiative_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id),
  update_type public.update_type NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  update_status public.update_status DEFAULT 'open',
  priority public.priority_level DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.initiative_updates ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_initiative_updates_initiative ON public.initiative_updates(initiative_id);
CREATE INDEX idx_initiative_updates_person ON public.initiative_updates(person_id);

-- RLS Policies for initiative_updates

-- View policy: Users can view updates for initiatives they're assigned to, or admins/managers can see all
CREATE POLICY "Users can view initiative updates"
ON public.initiative_updates
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  user_has_initiative_access(auth.uid(), initiative_id)
);

-- Insert policy: Role-based insert permissions
-- Contributors/Leads can insert 'update' type
-- Reviewers/Leads can insert 'review' and 'closure' types
-- Advisors can only insert 'comment' type
CREATE POLICY "Users can insert initiative updates based on role"
ON public.initiative_updates
FOR INSERT
WITH CHECK (
  person_id = get_current_person_id() AND
  (
    -- Admins and managers can insert any type
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    -- Check contribution role for the initiative
    (
      update_type = 'comment' AND EXISTS (
        SELECT 1 FROM public.contributions c
        WHERE c.initiative_id = initiative_updates.initiative_id
        AND c.person_id = initiative_updates.person_id
      )
    ) OR
    (
      update_type = 'update' AND EXISTS (
        SELECT 1 FROM public.contributions c
        WHERE c.initiative_id = initiative_updates.initiative_id
        AND c.person_id = initiative_updates.person_id
        AND c.contribution_role IN ('lead', 'contributor')
      )
    ) OR
    (
      update_type IN ('review', 'closure') AND EXISTS (
        SELECT 1 FROM public.contributions c
        WHERE c.initiative_id = initiative_updates.initiative_id
        AND c.person_id = initiative_updates.person_id
        AND c.contribution_role IN ('lead', 'reviewer')
      )
    )
  )
);

-- Update policy: Only the author can update their own updates
CREATE POLICY "Users can update own initiative updates"
ON public.initiative_updates
FOR UPDATE
USING (person_id = get_current_person_id())
WITH CHECK (person_id = get_current_person_id());

-- Delete policy: Only admins or the author can delete
CREATE POLICY "Users can delete own initiative updates"
ON public.initiative_updates
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  person_id = get_current_person_id()
);

-- Add trigger for updated_at
CREATE TRIGGER update_initiative_updates_updated_at
BEFORE UPDATE ON public.initiative_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Fix the monthly_snapshots security issue: Replace overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view snapshots" ON public.monthly_snapshots;

CREATE POLICY "Authenticated users can view snapshots"
ON public.monthly_snapshots
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'viewer'::app_role)
  )
);