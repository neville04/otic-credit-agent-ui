-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'it_admin', 'scheduler', 'viewer');

-- Create enum for report status
CREATE TYPE public.report_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create enum for schedule recurrence
CREATE TYPE public.schedule_recurrence AS ENUM ('one_time', 'daily', 'weekly', 'monthly', 'custom');

-- Organizations table (banks/clients)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  azure_connection_config JSONB, -- Store Azure-specific connection details
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table (user info linked to organizations)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  custom_prompt TEXT,
  status report_status DEFAULT 'pending',
  result JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Schedules table
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  custom_prompt TEXT,
  recurrence schedule_recurrence DEFAULT 'one_time',
  schedule_date TIMESTAMPTZ,
  schedule_time TEXT,
  timezone TEXT,
  output_formats TEXT[], -- ['excel', 'word', 'pdf', etc.]
  recipients TEXT[], -- email addresses
  knowledge_bases TEXT[], -- connected data sources
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Audit log table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- Security definer function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization(user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (id = public.get_user_organization(auth.uid()));

CREATE POLICY "Admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (
    id = public.get_user_organization(auth.uid()) AND
    public.get_user_role(auth.uid()) IN ('admin', 'it_admin')
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their organization"
  ON public.user_roles FOR SELECT
  USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Admins can manage roles in their organization"
  ON public.user_roles FOR ALL
  USING (
    organization_id = public.get_user_organization(auth.uid()) AND
    public.get_user_role(auth.uid()) IN ('admin', 'it_admin')
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their organization"
  ON public.profiles FOR SELECT
  USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles in their organization"
  ON public.profiles FOR ALL
  USING (
    organization_id = public.get_user_organization(auth.uid()) AND
    public.get_user_role(auth.uid()) IN ('admin', 'it_admin')
  );

-- RLS Policies for reports
CREATE POLICY "Users can view reports in their organization"
  ON public.reports FOR SELECT
  USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Schedulers can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization(auth.uid()) AND
    public.get_user_role(auth.uid()) IN ('admin', 'it_admin', 'scheduler')
  );

-- RLS Policies for schedules
CREATE POLICY "Users can view schedules in their organization"
  ON public.schedules FOR SELECT
  USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Schedulers can manage schedules"
  ON public.schedules FOR ALL
  USING (
    organization_id = public.get_user_organization(auth.uid()) AND
    public.get_user_role(auth.uid()) IN ('admin', 'it_admin', 'scheduler')
  );

-- RLS Policies for audit_logs
CREATE POLICY "Users can view audit logs in their organization"
  ON public.audit_logs FOR SELECT
  USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  -- For now, users need to be assigned to an organization manually
  -- This can be extended to auto-create organizations or use invitation system
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();