
-- Fix projects RLS
DO $$ BEGIN
  -- Drop all existing policies on projects
  DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
  DROP POLICY IF EXISTS "Authenticated can insert projects" ON public.projects;
  DROP POLICY IF EXISTS "Authenticated can update projects" ON public.projects;
  DROP POLICY IF EXISTS "Authenticated can delete projects" ON public.projects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Check and drop any remaining policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.projects', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'project_locations' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_locations', pol.policyname);
  END LOOP;
END $$;

-- Projects policies
CREATE POLICY "public_read_projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "auth_insert_projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_projects" ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_projects" ON public.projects FOR DELETE TO authenticated USING (true);

-- Locations policies
CREATE POLICY "public_read_locations" ON public.project_locations FOR SELECT USING (true);
CREATE POLICY "auth_insert_locations" ON public.project_locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_locations" ON public.project_locations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_locations" ON public.project_locations FOR DELETE TO authenticated USING (true);
