-- =============================================
-- MONTHLY DELIVERY SNAPSHOTS
-- =============================================

-- Create monthly_snapshots table
CREATE TABLE public.monthly_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year DATE NOT NULL, -- First day of the month (e.g., 2025-01-01 for January 2025)
  summary TEXT,
  key_deliveries TEXT,
  blockers_faced TEXT,
  lessons_learned TEXT,
  next_month_focus TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month_year)
);

-- Enable RLS
ALTER TABLE public.monthly_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view snapshots"
ON public.monthly_snapshots FOR SELECT
USING (true);

CREATE POLICY "Managers can create snapshots"
ON public.monthly_snapshots FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update snapshots"
ON public.monthly_snapshots FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete snapshots"
ON public.monthly_snapshots FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_monthly_snapshots_updated_at
  BEFORE UPDATE ON public.monthly_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- PEOPLE / CONTRIBUTORS
-- =============================================

-- Create people table
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  role_title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view people"
ON public.people FOR SELECT
USING (true);

CREATE POLICY "Managers can create people"
ON public.people FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update people"
ON public.people FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete people"
ON public.people FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- CONTRIBUTIONS (Links People to Initiatives)
-- =============================================

-- Contribution role enum
CREATE TYPE public.contribution_role AS ENUM ('lead', 'contributor', 'reviewer', 'advisor');

-- Performance rating enum
CREATE TYPE public.performance_rating AS ENUM ('exceptional', 'strong', 'meets_expectations', 'needs_improvement');

-- Create contributions table
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  contribution_role contribution_role NOT NULL DEFAULT 'contributor',
  contribution_summary TEXT,
  performance_rating performance_rating,
  assessment_notes TEXT,
  assessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person_id, initiative_id)
);

-- Enable RLS
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view contributions"
ON public.contributions FOR SELECT
USING (true);

CREATE POLICY "Managers can create contributions"
ON public.contributions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update contributions"
ON public.contributions FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete contributions"
ON public.contributions FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_contributions_updated_at
  BEFORE UPDATE ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();