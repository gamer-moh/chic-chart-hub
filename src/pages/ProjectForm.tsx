import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, MapPin, ArrowRight } from "lucide-react";
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
import { useCreateProject, useAddLocation } from "@/hooks/useProjects";

const projectSchema = z.object({
  name: z.string().trim().min(1, "اسم المشروع مطلوب").max(200),
  contract_value: z.coerce.number().min(0, "القيمة يجب أن تكون أكبر من صفر"),
  start_date: z.string().min(1, "تاريخ البداية مطلوب"),
  end_date: z.string().min(1, "تاريخ النهاية مطلوب"),
  duration_days: z.coerce.number().min(1, "المدة مطلوبة"),
  elapsed_days: z.coerce.number().min(0),
  actual_progress: z.coerce.number().min(0).max(100),
  planned_progress: z.coerce.number().min(0).max(100),
  status: z.string().min(1),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface LocationEntry {
  name: string;
  latitude: string;
  longitude: string;
  description: string;
}

const ProjectForm = () => {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const addLocation = useAddLocation();
  const [locations, setLocations] = useState<LocationEntry[]>([
    { name: "", latitude: "", longitude: "", description: "" },
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "على المسار",
      elapsed_days: 0,
      actual_progress: 0,
      planned_progress: 0,
    },
  });

  // Auto-calculate duration
  const startDate = watch("start_date");
  const endDate = watch("end_date");
  if (startDate && endDate) {
    const diff = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0) {
      const currentDuration = watch("duration_days");
      if (currentDuration !== diff) {
        setValue("duration_days", diff);
      }
    }
  }

  const addLocationRow = () => {
    setLocations([...locations, { name: "", latitude: "", longitude: "", description: "" }]);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const updateLocation = (index: number, field: keyof LocationEntry, value: string) => {
    const updated = [...locations];
    updated[index][field] = value;
    setLocations(updated);
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const project = await createProject.mutateAsync(data as any);

      // Add locations
      const validLocations = locations.filter(
        (l) => l.name && l.latitude && l.longitude
      );
      for (const loc of validLocations) {
        await addLocation.mutateAsync({
          project_id: project.id,
          name: loc.name,
          latitude: parseFloat(loc.latitude),
          longitude: parseFloat(loc.longitude),
          description: loc.description || null,
        });
      }

      toast.success("تم إضافة المشروع بنجاح");
      navigate("/");
    } catch {
      toast.error("حدث خطأ أثناء إضافة المشروع");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-l from-[hsl(var(--header-gradient-from))] to-[hsl(var(--header-gradient-to))] text-primary-foreground px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">إضافة مشروع جديد</h1>
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate("/")}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للوحة المتابعة
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
              {errors.contract_value && <p className="text-destructive text-xs mt-1">{errors.contract_value.message}</p>}
            </div>

            <div>
              <Label>حالة المشروع</Label>
              <Select
                defaultValue="على المسار"
                onValueChange={(v) => setValue("status", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="على المسار">على المسار</SelectItem>
                  <SelectItem value="متأخر">متأخر</SelectItem>
                  <SelectItem value="متقدم">متقدم</SelectItem>
                  <SelectItem value="متوقف">متوقف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>تاريخ البداية</Label>
              <Input type="date" {...register("start_date")} className="mt-1" />
              {errors.start_date && <p className="text-destructive text-xs mt-1">{errors.start_date.message}</p>}
            </div>

            <div>
              <Label>تاريخ النهاية</Label>
              <Input type="date" {...register("end_date")} className="mt-1" />
              {errors.end_date && <p className="text-destructive text-xs mt-1">{errors.end_date.message}</p>}
            </div>

            <div>
              <Label>مدة المشروع (يوم)</Label>
              <Input type="number" {...register("duration_days")} className="mt-1" readOnly />
            </div>

            <div>
              <Label>الأيام المنقضية</Label>
              <Input type="number" {...register("elapsed_days")} className="mt-1" />
            </div>

            <div>
              <Label>نسبة الإنجاز الفعلي (%)</Label>
              <Input type="number" step="0.01" max="100" {...register("actual_progress")} className="mt-1" />
            </div>

            <div>
              <Label>نسبة الإنجاز المخطط (%)</Label>
              <Input type="number" step="0.01" max="100" {...register("planned_progress")} className="mt-1" />
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              مواقع المشروع
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addLocationRow}>
              <Plus className="w-4 h-4 ml-1" />
              إضافة موقع
            </Button>
          </div>

          {locations.map((loc, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg relative">
              <div>
                <Label>اسم الموقع</Label>
                <Input
                  value={loc.name}
                  onChange={(e) => updateLocation(idx, "name", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>خط العرض</Label>
                <Input
                  type="number"
                  step="any"
                  value={loc.latitude}
                  onChange={(e) => updateLocation(idx, "latitude", e.target.value)}
                  className="mt-1"
                  placeholder="20.0000"
                />
              </div>
              <div>
                <Label>خط الطول</Label>
                <Input
                  type="number"
                  step="any"
                  value={loc.longitude}
                  onChange={(e) => updateLocation(idx, "longitude", e.target.value)}
                  className="mt-1"
                  placeholder="41.0000"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>الوصف</Label>
                  <Input
                    value={loc.description}
                    onChange={(e) => updateLocation(idx, "description", e.target.value)}
                    className="mt-1"
                  />
                </div>
                {locations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => removeLocation(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={createProject.isPending}>
          {createProject.isPending ? "جاري الحفظ..." : "حفظ المشروع"}
        </Button>
      </form>
    </div>
  );
};

export default ProjectForm;
