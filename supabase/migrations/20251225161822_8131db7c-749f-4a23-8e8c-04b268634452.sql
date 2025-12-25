-- Create initiative_allocations table for time-based workload tracking
CREATE TABLE public.initiative_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  role contribution_role NOT NULL DEFAULT 'contributor',
  allocated_hours_per_week INTEGER NOT NULL DEFAULT 8 CHECK (allocated_hours_per_week >= 0 AND allocated_hours_per_week <= 80),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (initiative_id, person_id)
);

-- Create capacity_settings table for system-wide configuration
CREATE TABLE public.capacity_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_capacity_hours INTEGER NOT NULL DEFAULT 40 CHECK (weekly_capacity_hours > 0 AND weekly_capacity_hours <= 168),
  role_multiplier_lead FLOAT NOT NULL DEFAULT 1.2 CHECK (role_multiplier_lead > 0),
  role_multiplier_contributor FLOAT NOT NULL DEFAULT 1.0 CHECK (role_multiplier_contributor > 0),
  role_multiplier_reviewer FLOAT NOT NULL DEFAULT 0.6 CHECK (role_multiplier_reviewer > 0),
  role_multiplier_advisor FLOAT NOT NULL DEFAULT 0.3 CHECK (role_multiplier_advisor > 0),
  complexity_low FLOAT NOT NULL DEFAULT 0.8 CHECK (complexity_low > 0),
  complexity_medium FLOAT NOT NULL DEFAULT 1.0 CHECK (complexity_medium > 0),
  complexity_high FLOAT NOT NULL DEFAULT 1.3 CHECK (complexity_high > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default capacity settings row
INSERT INTO public.capacity_settings DEFAULT VALUES;

-- Add complexity column to initiatives
ALTER TABLE public.initiatives 
ADD COLUMN complexity TEXT NOT NULL DEFAULT 'medium' 
CHECK (complexity IN ('low', 'medium', 'high'));

-- Create indexes for performance
CREATE INDEX idx_initiative_allocations_person ON public.initiative_allocations(person_id);
CREATE INDEX idx_initiative_allocations_initiative ON public.initiative_allocations(initiative_id);
CREATE INDEX idx_initiative_allocations_dates ON public.initiative_allocations(start_date, end_date);

-- Enable RLS on new tables
ALTER TABLE public.initiative_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for initiative_allocations
-- Admins and managers can view all allocations
CREATE POLICY "Admins and managers can view allocations"
ON public.initiative_allocations
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Users can view their own allocations
CREATE POLICY "Users can view own allocations"
ON public.initiative_allocations
FOR SELECT
USING (person_id = get_current_person_id());

-- Admins and managers can create allocations
CREATE POLICY "Admins and managers can create allocations"
ON public.initiative_allocations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Initiative leads can create allocations for their initiatives
CREATE POLICY "Initiative leads can create allocations"
ON public.initiative_allocations
FOR INSERT
WITH CHECK (is_initiative_lead(initiative_id, auth.uid()));

-- Admins and managers can update allocations
CREATE POLICY "Admins and managers can update allocations"
ON public.initiative_allocations
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Initiative leads can update allocations for their initiatives
CREATE POLICY "Initiative leads can update allocations"
ON public.initiative_allocations
FOR UPDATE
USING (is_initiative_lead(initiative_id, auth.uid()));

-- Only admins can delete allocations
CREATE POLICY "Admins can delete allocations"
ON public.initiative_allocations
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Managers can delete allocations
CREATE POLICY "Managers can delete allocations"
ON public.initiative_allocations
FOR DELETE
USING (has_role(auth.uid(), 'manager'));

-- RLS Policies for capacity_settings
-- All authenticated users can view capacity settings
CREATE POLICY "Authenticated users can view capacity settings"
ON public.capacity_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can update capacity settings
CREATE POLICY "Admins can update capacity settings"
ON public.capacity_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on initiative_allocations
CREATE TRIGGER update_initiative_allocations_updated_at
BEFORE UPDATE ON public.initiative_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create trigger for updated_at on capacity_settings
CREATE TRIGGER update_capacity_settings_updated_at
BEFORE UPDATE ON public.capacity_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Add audit triggers
CREATE TRIGGER audit_initiative_allocations
AFTER INSERT OR UPDATE OR DELETE ON public.initiative_allocations
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_capacity_settings
AFTER INSERT OR UPDATE OR DELETE ON public.capacity_settings
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();