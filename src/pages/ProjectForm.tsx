import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, MapPin, ArrowRight, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAddLocation } from "@/hooks/useProjects";
import { useQueryClient } from "@tanstack/react-query";

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

interface LocationEntry {
  name: string;
  latitude: string;
  longitude: string;
  description: string;
}

interface StaffEntry {
  role: string;
  count: string;
}

interface ActivityEntry {
  description: string;
  contract_quantity: string;
  executed_quantity: string;
  remaining_quantity: string;
  location_name: string;
}

interface DocumentEntry {
  title: string;
  file: File | null;
}

const ProjectForm = () => {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const addLocation = useAddLocation();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [locations, setLocations] = useState<LocationEntry[]>([
    { name: "", latitude: "", longitude: "", description: "" },
  ]);

  const [staffEntries, setStaffEntries] = useState<StaffEntry[]>([
    { role: "", count: "1" },
  ]);

  const [activities, setActivities] = useState<ActivityEntry[]>([
    { description: "", contract_quantity: "0", executed_quantity: "0", remaining_quantity: "0", location_name: "" },
  ]);

  const [documents, setDocuments] = useState<DocumentEntry[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "على المسار", elapsed_days: 0, actual_progress: 0, planned_progress: 0,
      workers_count: 0, work_hours_weekly: 0, remaining_days: 0,
      total_penalties: 0, weekly_actual_progress: 0, weekly_planned_progress: 0, last_extract_number: 0,
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  useEffect(() => {
    if (startDate && endDate) {
      const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) setValue("duration_days", diff);
    }
  }, [startDate, endDate, setValue]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جاري التحميل...</div>;
  }

  if (!user) return null;

  const onSubmit = async (data: ProjectFormData) => {
    setSaving(true);
    try {
      const { data: project, error } = await (supabase.from("projects").insert({
        ...data,
        department_id: departmentId,
      } as any).select().single() as any);
      if (error) throw error;

      // Add locations
      const validLocations = locations.filter((l) => l.name && l.latitude && l.longitude);
      for (const loc of validLocations) {
        await addLocation.mutateAsync({
          project_id: project.id,
          name: loc.name,
          latitude: parseFloat(loc.latitude),
          longitude: parseFloat(loc.longitude),
          description: loc.description || null,
        });
      }

      // Add staff
      const validStaff = staffEntries.filter((s) => s.role.trim() && parseInt(s.count) > 0);
      for (const s of validStaff) {
        await (supabase.from("project_staff" as any).insert({
          project_id: project.id,
          role: s.role,
          count: parseInt(s.count),
        }) as any);
      }

      // Add activities
      const validActivities = activities.filter((a) => a.description.trim());
      for (const act of validActivities) {
        await (supabase.from("project_activities" as any).insert({
          project_id: project.id,
          description: act.description,
          contract_quantity: parseFloat(act.contract_quantity) || 0,
          executed_quantity: parseFloat(act.executed_quantity) || 0,
          remaining_quantity: parseFloat(act.remaining_quantity) || 0,
          location_name: act.location_name || null,
        }) as any);
      }

      // Upload documents
      for (const doc of documents) {
        if (!doc.file || !doc.title.trim()) continue;

        const ext = doc.file.name.split(".").pop()?.toLowerCase() || "file";
        const path = `${project.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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
          project_id: project.id,
          title: doc.title.trim(),
          file_url: urlData.publicUrl,
          file_type: fileType,
        });

        if (documentInsertError) {
          throw new Error(`تم رفع الملف ولكن فشل حفظ بياناته: ${documentInsertError.message}`);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["dept_projects"] });
      toast.success("تم إضافة المشروع بنجاح");
      navigate(`/departments/${departmentId}`);
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-l from-[hsl(var(--header-gradient-from))] to-[hsl(var(--header-gradient-to))] text-primary-foreground px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">إضافة مشروع جديد</h1>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(`/departments/${departmentId}`)}>
            <ArrowRight className="w-4 h-4 ml-2" /> العودة
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-foreground">معلومات المشروع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label>اسم المشروع</Label>
              <Input {...register("name")} className="mt-1" />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>قيمة العقد (ر.س)</Label>
              <Input type="number" step="0.01" {...register("contract_value")} className="mt-1" />
            </div>
            <div>
              <Label>اسم المقاول</Label>
              <Input {...register("contractor_name")} className="mt-1" />
            </div>
            <div>
              <Label>حالة المشروع</Label>
              <Select defaultValue="على المسار" onValueChange={(v) => setValue("status", v)}>
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

        {/* Staff - Dynamic */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">كادر المشروع</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setStaffEntries([...staffEntries, { role: "", count: "1" }])}>
              <Plus className="w-4 h-4 ml-1" /> إضافة وظيفة
            </Button>
          </div>
          {staffEntries.map((s, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="md:col-span-2">
                <Label>المسمى الوظيفي</Label>
                <Input
                  value={s.role}
                  onChange={(e) => {
                    const updated = [...staffEntries];
                    updated[idx].role = e.target.value;
                    setStaffEntries(updated);
                  }}
                  placeholder="مثال: مهندس مدني"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>العدد</Label>
                  <Input
                    type="number" min="0"
                    value={s.count}
                    onChange={(e) => {
                      const updated = [...staffEntries];
                      updated[idx].count = e.target.value;
                      setStaffEntries(updated);
                    }}
                    className="mt-1"
                  />
                </div>
                {staffEntries.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => setStaffEntries(staffEntries.filter((_, i) => i !== idx))}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Activities / البنود */}
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
                  <Input
                    value={act.description}
                    onChange={(e) => { const u = [...activities]; u[idx].description = e.target.value; setActivities(u); }}
                    placeholder="مثال: أعمال الحفر والردم"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>كمية العقد</Label>
                  <Input type="number" step="any" value={act.contract_quantity} onChange={(e) => { const u = [...activities]; u[idx].contract_quantity = e.target.value; setActivities(u); }} className="mt-1" />
                </div>
                <div>
                  <Label>إجمالي المنفذ</Label>
                  <Input type="number" step="any" value={act.executed_quantity} onChange={(e) => { const u = [...activities]; u[idx].executed_quantity = e.target.value; setActivities(u); }} className="mt-1" />
                </div>
                <div>
                  <Label>الكمية المتبقية</Label>
                  <Input type="number" step="any" value={act.remaining_quantity} onChange={(e) => { const u = [...activities]; u[idx].remaining_quantity = e.target.value; setActivities(u); }} className="mt-1" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>اسم الموقع</Label>
                    <Input value={act.location_name} onChange={(e) => { const u = [...activities]; u[idx].location_name = e.target.value; setActivities(u); }} className="mt-1" />
                  </div>
                  {activities.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => setActivities(activities.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Locations */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> مواقع المشروع
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setLocations([...locations, { name: "", latitude: "", longitude: "", description: "" }])}>
              <Plus className="w-4 h-4 ml-1" /> إضافة موقع
            </Button>
          </div>
          {locations.map((loc, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div><Label>اسم الموقع</Label><Input value={loc.name} onChange={(e) => { const u = [...locations]; u[idx].name = e.target.value; setLocations(u); }} className="mt-1" /></div>
              <div><Label>خط العرض</Label><Input type="number" step="any" value={loc.latitude} onChange={(e) => { const u = [...locations]; u[idx].latitude = e.target.value; setLocations(u); }} className="mt-1" placeholder="20.0" /></div>
              <div><Label>خط الطول</Label><Input type="number" step="any" value={loc.longitude} onChange={(e) => { const u = [...locations]; u[idx].longitude = e.target.value; setLocations(u); }} className="mt-1" placeholder="41.0" /></div>
              <div className="flex items-end gap-2">
                <div className="flex-1"><Label>الوصف</Label><Input value={loc.description} onChange={(e) => { const u = [...locations]; u[idx].description = e.target.value; setLocations(u); }} className="mt-1" /></div>
                {locations.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => setLocations(locations.filter((_, i) => i !== idx))}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Documents Upload */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> ورقيات المشروع
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setDocuments([...documents, { title: "", file: null }])}>
              <Plus className="w-4 h-4 ml-1" /> إضافة مستند
            </Button>
          </div>
          {documents.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">لم تتم إضافة مستندات بعد. اضغط "إضافة مستند" لرفع ملفات.</p>
          )}
          {documents.map((doc, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>عنوان المستند</Label>
                <Input
                  value={doc.title}
                  onChange={(e) => { const u = [...documents]; u[idx].title = e.target.value; setDocuments(u); }}
                  placeholder="مثال: محضر ترسية"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>الملف (صورة أو PDF)</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => { const u = [...documents]; u[idx].file = e.target.files?.[0] || null; setDocuments(u); }}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "جاري الحفظ..." : "حفظ المشروع"}
        </Button>
      </form>
    </div>
  );
};

export default ProjectForm;
