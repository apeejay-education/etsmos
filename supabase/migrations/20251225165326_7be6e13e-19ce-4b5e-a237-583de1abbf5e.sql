-- Create initiative_tasks table for task management within initiatives
CREATE TABLE public.initiative_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_hours INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES public.people(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'done')),
  due_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.initiative_tasks ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_initiative_tasks_initiative_id ON public.initiative_tasks(initiative_id);
CREATE INDEX idx_initiative_tasks_assigned_to ON public.initiative_tasks(assigned_to);
CREATE INDEX idx_initiative_tasks_status ON public.initiative_tasks(status);

-- Trigger for updated_at
CREATE TRIGGER update_initiative_tasks_updated_at
  BEFORE UPDATE ON public.initiative_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies

-- Admins and managers can view all tasks
CREATE POLICY "Admins and managers can view tasks"
  ON public.initiative_tasks FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Users can view tasks for initiatives they have access to
CREATE POLICY "Users can view tasks for their initiatives"
  ON public.initiative_tasks FOR SELECT
  USING (user_has_initiative_access(auth.uid(), initiative_id));

-- Admins and managers can create tasks
CREATE POLICY "Admins and managers can create tasks"
  ON public.initiative_tasks FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Initiative leads can create tasks for their initiatives
CREATE POLICY "Initiative leads can create tasks"
  ON public.initiative_tasks FOR INSERT
  WITH CHECK (is_initiative_lead(initiative_id, auth.uid()));

-- Admins and managers can update tasks
CREATE POLICY "Admins and managers can update tasks"
  ON public.initiative_tasks FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Initiative leads can update tasks for their initiatives
CREATE POLICY "Initiative leads can update tasks"
  ON public.initiative_tasks FOR UPDATE
  USING (is_initiative_lead(initiative_id, auth.uid()));

-- Assigned contributors can update status of their tasks
CREATE POLICY "Contributors can update their assigned tasks"
  ON public.initiative_tasks FOR UPDATE
  USING (assigned_to = get_current_person_id());

-- Admins can delete tasks
CREATE POLICY "Admins can delete tasks"
  ON public.initiative_tasks FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Managers can delete tasks
CREATE POLICY "Managers can delete tasks"
  ON public.initiative_tasks FOR DELETE
  USING (has_role(auth.uid(), 'manager'));

-- Initiative leads can delete tasks for their initiatives
CREATE POLICY "Initiative leads can delete tasks"
  ON public.initiative_tasks FOR DELETE
  USING (is_initiative_lead(initiative_id, auth.uid()));