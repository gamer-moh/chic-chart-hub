import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Upload, FileText, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const ProjectDocuments = () => {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const { data: documents } = useQuery({
    queryKey: ["project_documents", selectedProjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_documents" as any)
        .select("*")
        .eq("project_id", selectedProjectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!selectedProjectId,
  });

  const deleteDoc = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_documents" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_documents"] });
      toast.success("تم حذف المستند");
    },
  });

  if (!selectedProjectId && projects && projects.length > 0) {
    setSelectedProjectId(projects[0].id);
  }

  const handleUpload = async () => {
    if (!file || !title || !selectedProjectId) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${selectedProjectId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("project-documents").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("project-documents").getPublicUrl(path);
      const fileType = file.type.startsWith("image/") ? "image" : "pdf";

      const { error: insertError } = await supabase.from("project_documents" as any).insert({
        project_id: selectedProjectId,
        title,
        file_url: urlData.publicUrl,
        file_type: fileType,
      });
      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["project_documents"] });
      setTitle("");
      setFile(null);
      toast.success("تم رفع المستند بنجاح");
    } catch (error: any) {
      toast.error(error.message || "خطأ في رفع الملف");
    } finally {
      setUploading(false);
    }
  };

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
          <div className="w-32" />
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

        {user && selectedProjectId && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground">رفع مستند جديد</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>عنوان المستند</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: محضر ترسية" className="mt-1" />
              </div>
              <div>
                <Label>الملف (صورة أو PDF)</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1" />
              </div>
              <div className="flex items-end">
                <Button onClick={handleUpload} disabled={uploading} className="w-full">
                  <Upload className="w-4 h-4 ml-2" />
                  {uploading ? "جاري الرفع..." : "رفع"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents && documents.length > 0 ? documents.map((doc: any) => (
            <div key={doc.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
                {doc.file_type === "image" ? (
                  <img src={doc.file_url} alt={doc.title} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              <div className="p-4">
                <p className="font-bold text-foreground text-sm">{doc.title}</p>
                <div className="flex items-center gap-2 mt-3">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Eye className="w-3 h-3" /> معاينة
                  </a>
                  {user && (
                    <button onClick={() => deleteDoc.mutate(doc.id)} className="text-xs text-destructive hover:underline flex items-center gap-1 mr-auto">
                      <Trash2 className="w-3 h-3" /> حذف
                    </button>
                  )}
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
