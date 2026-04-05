import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, FileText, Eye, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const ProjectDocuments = () => {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const { data: projects } = useQuery({
    queryKey: ["dept_projects_docs", departmentId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("projects")
        .select("*") as any)
        .eq("department_id", departmentId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!departmentId,
  });

  const { data: documentRows } = useQuery({
    queryKey: ["project_documents", selectedProjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_documents")
        .select("*")
        .eq("project_id", selectedProjectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProjectId,
  });

  const { data: storageFiles } = useQuery({
    queryKey: ["project_documents_storage", selectedProjectId],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("project-documents")
        .list(selectedProjectId, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProjectId,
  });

  useEffect(() => {
    if (!selectedProjectId && projects && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const documents = useMemo(() => {
    const dbDocs = documentRows || [];
    const dbUrls = new Set(dbDocs.map((d: any) => d.file_url));

    // Build storage-only docs (not already in DB)
    const storageDocs = (storageFiles || [])
      .filter((file) => file.name && !file.name.endsWith("/"))
      .map((file) => {
        const path = `${selectedProjectId}/${file.name}`;
        const { data } = supabase.storage.from("project-documents").getPublicUrl(path);
        const extension = file.name.split(".").pop()?.toLowerCase();
        const isPdf = extension === "pdf";
        return {
          id: path,
          title: file.name.replace(/\.[^.]+$/, ""),
          file_url: data.publicUrl,
          file_type: isPdf ? "pdf" : "image",
        };
      })
      .filter((doc) => !dbUrls.has(doc.file_url));

    return [...dbDocs, ...storageDocs];
  }, [documentRows, storageFiles, selectedProjectId]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/departments/${departmentId}/details`)}>
            <ArrowRight className="w-4 h-4 ml-2" />
            تفاصيل المشاريع
          </Button>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            ورقيات المشروع
          </h2>
          <Button variant="outline" onClick={() => navigate("/closing")}>
            الخاتمة
          </Button>
        </div>

        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="اختر المشروع" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents && documents.length > 0 ? documents.map((doc: any) => (
            <div key={doc.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
                {doc.file_type === "image" ? (
                  <img src={doc.file_url} alt={doc.title} className="w-full h-full object-contain bg-background" loading="lazy" />
                ) : doc.file_type === "pdf" ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/60 p-4 text-center">
                    <FileText className="w-12 h-12 text-primary" />
                    <p className="text-sm font-medium text-foreground">ملف PDF</p>
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/60 p-4 text-center">
                    <ImageIcon className="w-12 h-12 text-primary" />
                    <p className="text-sm font-medium text-foreground">مرفق</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-bold text-foreground text-sm break-words">{doc.title}</p>
                <div className="flex items-center gap-2 mt-3">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {doc.file_type === "pdf" ? "فتح PDF" : "معاينة"}
                  </a>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center text-muted-foreground py-12">لا توجد مستندات مرفقة</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDocuments;
