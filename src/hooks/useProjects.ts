import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectLocation = Database["public"]["Tables"]["project_locations"]["Row"];
type LocationInsert = Database["public"]["Tables"]["project_locations"]["Insert"];

export type { Project, ProjectInsert, ProjectLocation, LocationInsert };

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });
};

export const useProjectLocations = (projectId?: string) => {
  return useQuery({
    queryKey: ["project_locations", projectId],
    queryFn: async () => {
      let query = supabase.from("project_locations").select("*");
      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as ProjectLocation[];
    },
  });
};

export const useAllLocations = () => {
  return useQuery({
    queryKey: ["all_project_locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_locations")
        .select("*, projects(name)");
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: ProjectInsert) => {
      const { data, error } = await supabase
        .from("projects")
        .insert(project)
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useAddLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (location: LocationInsert) => {
      const { data, error } = await supabase
        .from("project_locations")
        .insert(location)
        .select()
        .single();
      if (error) throw error;
      return data as ProjectLocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_locations"] });
      queryClient.invalidateQueries({ queryKey: ["all_project_locations"] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_locations"] });
      queryClient.invalidateQueries({ queryKey: ["all_project_locations"] });
    },
  });
};
