-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'viewer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'manager' THEN 2 
      WHEN 'viewer' THEN 3 
    END
  LIMIT 1
$$;

-- Profile RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS policies  
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Product lifecycle and priority enums
CREATE TYPE public.product_lifecycle AS ENUM ('ideation', 'build', 'live', 'scale', 'maintenance', 'sunset');
CREATE TYPE public.priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.product_type AS ENUM ('internal', 'external', 'client', 'rnd');

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  product_type product_type NOT NULL DEFAULT 'internal',
  lifecycle_stage product_lifecycle NOT NULL DEFAULT 'ideation',
  strategic_priority priority_level NOT NULL DEFAULT 'medium',
  business_owner TEXT,
  tech_owner TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products RLS - authenticated users can view, managers+ can edit
CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can create products" ON public.products
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update products" ON public.products
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Initiative enums
CREATE TYPE public.approval_source AS ENUM ('board', 'chairman', 'management', 'internal');
CREATE TYPE public.strategic_category AS ENUM ('revenue', 'compliance', 'operations', 'quality', 'brand');
CREATE TYPE public.sensitivity_level AS ENUM ('confidential', 'internal', 'routine');
CREATE TYPE public.initiative_status AS ENUM ('approved', 'in_progress', 'blocked', 'delivered', 'dropped');
CREATE TYPE public.delivery_window AS ENUM ('immediate', 'month', 'quarter', 'flexible');
CREATE TYPE public.outcome_match AS ENUM ('fully', 'partial', 'missed');

-- Initiatives table
CREATE TABLE public.initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  context TEXT,
  expected_outcome TEXT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  approval_source approval_source NOT NULL DEFAULT 'internal',
  approving_authority TEXT,
  approval_date DATE,
  approval_evidence TEXT,
  strategic_category strategic_category,
  sensitivity_level sensitivity_level NOT NULL DEFAULT 'routine',
  priority_level priority_level NOT NULL DEFAULT 'medium',
  accountable_owner TEXT,
  escalation_owner TEXT,
  status initiative_status NOT NULL DEFAULT 'approved',
  target_delivery_window delivery_window NOT NULL DEFAULT 'flexible',
  actual_delivery_date DATE,
  delivered_outcome_summary TEXT,
  outcome_vs_intent outcome_match,
  closure_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;

-- Initiatives RLS
CREATE POLICY "Authenticated users can view initiatives" ON public.initiatives
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can create initiatives" ON public.initiatives
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update initiatives" ON public.initiatives
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete initiatives" ON public.initiatives
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Execution signals enums
CREATE TYPE public.execution_stage AS ENUM ('not_started', 'active', 'paused', 'completed');
CREATE TYPE public.health_status AS ENUM ('green', 'amber', 'red');

-- Execution signals table
CREATE TABLE public.execution_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL UNIQUE REFERENCES public.initiatives(id) ON DELETE CASCADE,
  execution_stage execution_stage NOT NULL DEFAULT 'not_started',
  health_status health_status NOT NULL DEFAULT 'green',
  risk_blocker_summary TEXT,
  last_management_touch TIMESTAMPTZ,
  next_expected_movement DATE,
  jira_epics TEXT,
  last_jira_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.execution_signals ENABLE ROW LEVEL SECURITY;

-- Execution signals RLS
CREATE POLICY "Authenticated users can view signals" ON public.execution_signals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can create signals" ON public.execution_signals
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update signals" ON public.execution_signals
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete signals" ON public.execution_signals
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for auto-creating profiles and assigning default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- First user gets admin role, others get viewer
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_initiatives_updated_at
  BEFORE UPDATE ON public.initiatives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_execution_signals_updated_at
  BEFORE UPDATE ON public.execution_signals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();