
-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contract_value NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 0,
  elapsed_days INTEGER NOT NULL DEFAULT 0,
  actual_progress NUMERIC NOT NULL DEFAULT 0,
  planned_progress NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'على المسار',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_locations table
CREATE TABLE public.project_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_locations ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required for this dashboard)
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Anyone can view locations" ON public.project_locations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert locations" ON public.project_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update locations" ON public.project_locations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete locations" ON public.project_locations FOR DELETE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
