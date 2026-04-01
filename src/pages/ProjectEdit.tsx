import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const projectSchema = z.object({
  name: z.string().trim().min(1, "اسم المشروع مطلوب").max(200),
  contract_value: z.coerce.number().min(0),
  start_date: z.string().min(1, "تاريخ البداية مطلوب"),
  end_date: z.string().min(1, "تاريخ النهاية مطلوب"),
  duration_days: z.coerce.number().min(1),
  elapsed_days: z.coerce.number().min(0),
  actual_progress: z.coerce.number().min(0).max(100),
  planned_progress: z.coerce.number().min(0).max(100),
  status: z.string().min(1),
  contractor_name: z.string().optional(),
  workers_count: z.coerce.number().min(0).optional(),
  work_hours_weekly: z.coerce.number().min(0).optional(),
  remaining_days: z.coerce.number().min(0).optional(),
  total_penalties: z.coerce.number().min(0).optional(),
  weekly_actual_progress: z.coerce.number().min(0).optional(),
  weekly_planned_progress: z.coerce.number().min(0).optional(),
  last_extract_number: z.coerce.number().min(0).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ActivityEntry {
  id?: string;
  description: string;
  contract_quantity: string;
  executed_quantity: string;
  remaining_quantity: string;
  location_name: string;
}

interface DocumentEntry {
  id?: string;
  title: string;
  file: File | null;
  file_url?: string;
  file_type?: string;
}

const ProjectEdit = () => {
  const navigate = useNavigate();
  const { departmentId, projectId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [newDocuments, setNewDocuments] = useState<DocumentEntry[]>([]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  useEffect(() => {
    if (startDate && endDate) {
      const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) setValue("duration_days", diff);
    }
  }, [startDate, endDate, setValue]);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project_edit", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const { data: existingActivities } = useQuery({
    queryKey: ["project_activities_edit", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_activities")
        .select("*")
        .eq("project_id", projectId!);
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const { data: existingDocs } = useQuery({
    queryKey: ["project_documents_edit", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_documents")
        .select("*")
        .eq("project_id", projectId!);
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        contract_value: project.contract_value,
        start_date: project.start_date,
        end_date: project.end_date,
        duration_days: project.duration_days,
        elapsed_days: project.elapsed_days,
        actual_progress: project.actual_progress,
        planned_progress: project.planned_progress,
        status: project.status,
        contractor_name: project.contractor_name || "",
        workers_count: project.workers_count || 0,
        work_hours_weekly: project.work_hours_weekly || 0,
        remaining_days: project.remaining_days || 0,
        total_penalties: project.total_penalties || 0,
        weekly_actual_progress: project.weekly_actual_progress || 0,
        weekly_planned_progress: project.weekly_planned_progress || 0,
        last_extract_number: project.last_extract_number || 0,
      });
    }
  }, [project, reset]);

  useEffect(() => {
    if (existingActivities) {
      setActivities(existingActivities.map(a => ({
        id: a.id,
        description: a.description,
        contract_quantity: String(a.contract_quantity),
        executed_quantity: String(a.executed_quantity),
        remaining_quantity: String(a.remaining_quantity),
        location_name: a.location_name || "",
      })));
    }
  }, [existingActivities]);

  useEffect(() => {
    if (existingDocs) {
      setDocuments(existingDocs.map(d => ({
        id: d.id,
        title: d.title,
        file: null,
        file_url: d.file_url,
        file_type: d.file_type,
      })));
    }
  }, [existingDocs]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جاري التحميل...</div>;
  }
  if (!user || !project) return null;

  const onSubmit = async (data: ProjectFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          ...data,
          department_id: departmentId,
        } as any)
        .eq("id", projectId!);
      if (error) throw error;

      await supabase.from("project_activities").delete().eq("project_id", projectId!);
      const validActivities = activities.filter(a => a.description.trim());
      for (const act of validActivities) {
        await supabase.from("project_activities").insert({
          project_id: projectId!,
          description: act.description,
          contract_quantity: parseFloat(act.contract_quantity) || 0,
          executed_quantity: parseFloat(act.executed_quantity) || 0,
          remaining_quantity: parseFloat(act.remaining_quantity) || 0,
          location_name: act.location_name || null,
        });
      }

      for (const doc of newDocuments) {
        if (!doc.file || !doc.title.trim()) continue;

        const ext = doc.file.name.split(".").pop()?.toLowerCase() || "file";
        const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("project-documents")
          .upload(path, doc.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: doc.file.type || undefined,
          });

        if (uploadError) {
          throw new Error(`فشل رفع الملف ${doc.title}: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from("project-documents").getPublicUrl(path);
        const fileType = doc.file.type === "application/pdf" ? "pdf" : doc.file.type.startsWith("image/") ? "image" : "file";

        const { error: documentInsertError } = await supabase.from("project_documents").insert({
          project_id: projectId!,
          title: doc.title.trim(),
          file_url: urlData.publicUrl,
          file_type: fileType,
        });

        if (documentInsertError) {
          throw new Error(`تم رفع الملف ولكن فشل حفظ بياناته: ${documentInsertError.message}`);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dept_projects"] });
      queryClient.invalidateQueries({ queryKey: ["project_activities"] });
      queryClient.invalidateQueries({ queryKey: ["project_documents"] });
      toast.success("تم تحديث المشروع بنجاح");
      navigate(`/departments/${departmentId}/details`);
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      await supabase.from("project_documents").delete().eq("id", docId);
      setDocuments(documents.filter(d => d.id !== docId));
      toast.success("تم حذف المستند");
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-l from-[hsl(var(--header-gradient-from))] to-[hsl(var(--header-gradient-to))] text-primary-foreground px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">تعديل المشروع</h1>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(`/departments/${departmentId}/details`)}>
            <ArrowRight className="w-4 h-4 ml-2" /> العودة
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-foreground">معلومات المشروع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label>اسم المشروع</Label>
              <Input {...register("name")} className="mt-1" />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div><Label>قيمة العقد (ر.س)</Label><Input type="number" step="0.01" {...register("contract_value")} className="mt-1" /></div>
            <div><Label>اسم المقاول</Label><Input {...register("contractor_name")} className="mt-1" /></div>
            <div>
              <Label>حالة المشروع</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="على المسار">على المسار</SelectItem>
                  <SelectItem value="متأخر">متأخر</SelectItem>
                  <SelectItem value="متقدم">متقدم</SelectItem>
                  <SelectItem value="متوقف">متوقف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>تاريخ البداية</Label><Input type="date" {...register("start_date")} className="mt-1" /></div>
            <div><Label>تاريخ النهاية</Label><Input type="date" {...register("end_date")} className="mt-1" /></div>
            <div><Label>مدة المشروع (يوم)</Label><Input type="number" {...register("duration_days")} className="mt-1" readOnly /></div>
            <div><Label>الأيام المنقضية</Label><Input type="number" {...register("elapsed_days")} className="mt-1" /></div>
            <div><Label>الأيام المتبقية</Label><Input type="number" {...register("remaining_days")} className="mt-1" /></div>
            <div><Label>نسبة الإنجاز الفعلي (%)</Label><Input type="number" step="0.01" max="100" {...register("actual_progress")} className="mt-1" /></div>
            <div><Label>نسبة الإنجاز المخطط (%)</Label><Input type="number" step="0.01" max="100" {...register("planned_progress")} className="mt-1" /></div>
            <div><Label>عدد العمالة</Label><Input type="number" {...register("workers_count")} className="mt-1" /></div>
            <div><Label>ساعات العمل الأسبوعية</Label><Input type="number" {...register("work_hours_weekly")} className="mt-1" /></div>
            <div><Label>إجمالي الغرامات</Label><Input type="number" step="0.01" {...register("total_penalties")} className="mt-1" /></div>
            <div><Label>الإنجاز الأسبوعي الفعلي</Label><Input type="number" step="0.001" {...register("weekly_actual_progress")} className="mt-1" /></div>
            <div><Label>الإنجاز الأسبوعي المخطط</Label><Input type="number" step="0.001" {...register("weekly_planned_progress")} className="mt-1" /></div>
            <div><Label>رقم آخر مستخلص</Label><Input type="number" {...register("last_extract_number")} className="mt-1" /></div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">الأنشطة الرئيسية / البنود</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setActivities([...activities, { description: "", contract_quantity: "0", executed_quantity: "0", remaining_quantity: "0", location_name: "" }])}>
              <Plus className="w-4 h-4 ml-1" /> إضافة بند
            </Button>
          </div>
          {activities.map((act, idx) => (
            <div key={idx} className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>وصف النشاط</Label>
                  <Input value={act.description} onChange={(e) => { const u = [...activities]; u[idx].description = e.target.value; setActivities(u); }} className="mt-1" />
                </div>
                <div><Label>كمية العقد</Label><Input type="number" step="any" value={act.contract_quantity} onChange={(e) => { const u = [...activities]; u[idx].contract_quantity = e.target.value; setActivities(u); }} className="mt-1" /></div>
                <div><Label>إجمالي المنفذ</Label><Input type="number" step="any" value={act.executed_quantity} onChange={(e) => { const u = [...activities]; u[idx].executed_quantity = e.target.value; setActivities(u); }} className="mt-1" /></div>
                <div><Label>الكمية المتبقية</Label><Input type="number" step="any" value={act.remaining_quantity} onChange={(e) => { const u = [...activities]; u[idx].remaining_quantity = e.target.value; setActivities(u); }} className="mt-1" /></div>
                <div className="flex items-end gap-2">
                  <div className="flex-1"><Label>اسم الموقع</Label><Input value={act.location_name} onChange={(e) => { const u = [...activities]; u[idx].location_name = e.target.value; setActivities(u); }} className="mt-1" /></div>
                  {activities.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => setActivities(activities.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">لا توجد بنود. اضغط "إضافة بند" لإضافة بند جديد.</p>}
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> المستندات الحالية
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setNewDocuments([...newDocuments, { title: "", file: null }])}>
              <Plus className="w-4 h-4 ml-1" /> إضافة مستند جديد
            </Button>
          </div>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{doc.title}</span>
                    <span className="text-xs text-muted-foreground">({doc.file_type})</span>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => deleteDocument(doc.id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">لا توجد مستندات</p>
          )}

          {newDocuments.map((doc, idx) => (
            <div key={`new-${idx}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>عنوان المستند</Label>
                <Input value={doc.title} onChange={(e) => { const u = [...newDocuments]; u[idx].title = e.target.value; setNewDocuments(u); }} placeholder="مثال: محضر ترسية" className="mt-1" />
              </div>
              <div>
                <Label>الملف (صورة أو PDF)</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => { const u = [...newDocuments]; u[idx].file = e.target.files?.[0] || null; setNewDocuments(u); }} className="mt-1" />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => setNewDocuments(newDocuments.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "جاري الحفظ..." : "تحديث المشروع"}
        </Button>
      </form>
    </div>
  );
};

export default ProjectEdit;
