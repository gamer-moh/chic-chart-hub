
-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'building',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.departments (name, icon, sort_order) VALUES
  ('إدارة صيانة الطرق والسيول', 'road', 1),
  ('إدارة صيانة المرافق', 'wrench', 2),
  ('إدارة المختبر', 'flask-conical', 3),
  ('إدارة صيانة الإنارة', 'lightbulb', 4),
  ('إدارة الدعم والبلاغات', 'headset', 5);

-- Add columns to projects (IF NOT EXISTS)
DO $$ BEGIN
  ALTER TABLE public.projects ADD COLUMN department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN ALTER TABLE public.projects ADD COLUMN contractor_name TEXT DEFAULT ''; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.projects ADD COLUMN workers_count INT DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.projects ADD COLUMN work_hours_weekly INT DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.projects ADD COLUMN remaining_days INT DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.projects ADD COLUMN total_penalties NUMERIC DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.projects ADD COLUMN weekly_actual_progress NUMERIC DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.projects ADD COLUMN weekly_planned_progress NUMERIC DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.projects ADD COLUMN last_extract_number INT DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Project staff
CREATE TABLE IF NOT EXISTS public.project_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project activities
CREATE TABLE IF NOT EXISTS public.project_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  contract_quantity NUMERIC NOT NULL DEFAULT 0,
  executed_quantity NUMERIC NOT NULL DEFAULT 0,
  remaining_quantity NUMERIC NOT NULL DEFAULT 0,
  location_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project documents
CREATE TABLE IF NOT EXISTS public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pub_read_depts" ON public.departments FOR SELECT USING (true);
CREATE POLICY "auth_write_depts" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "pub_read_staff" ON public.project_staff FOR SELECT USING (true);
CREATE POLICY "auth_write_staff" ON public.project_staff FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "pub_read_activities" ON public.project_activities FOR SELECT USING (true);
CREATE POLICY "auth_write_activities" ON public.project_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "pub_read_docs" ON public.project_documents FOR SELECT USING (true);
CREATE POLICY "auth_write_docs" ON public.project_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fix projects/locations RLS for public read + auth write
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.projects', pol.policyname); END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'project_locations' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_locations', pol.policyname); END LOOP;
END $$;

CREATE POLICY "pub_read_projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "auth_ins_projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_upd_projects" ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_del_projects" ON public.projects FOR DELETE TO authenticated USING (true);

CREATE POLICY "pub_read_locs" ON public.project_locations FOR SELECT USING (true);
CREATE POLICY "auth_ins_locs" ON public.project_locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_upd_locs" ON public.project_locations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_del_locs" ON public.project_locations FOR DELETE TO authenticated USING (true);
