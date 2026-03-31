import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Banknote, Users, Clock, Calendar, CheckCircle, AlertTriangle } from "lucide-react";

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const { data: projects } = useQuery({
    queryKey: ["dept_projects", departmentId],
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

  const project = projects?.find((p: any) => p.id === selectedProjectId) as any;

  const { data: activities } = useQuery({
    queryKey: ["project_activities", selectedProjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_activities" as any)
        .select("*")
        .eq("project_id", selectedProjectId);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!selectedProjectId,
  });

  if (!selectedProjectId && projects && projects.length > 0) {
    setSelectedProjectId(projects[0].id);
  }

  const statusColor = project?.status === "على المسار" ? "bg-primary text-primary-foreground" : "bg-chart-orange text-white";
  const statusIcon = project?.status === "على المسار"
    ? <CheckCircle className="w-5 h-5" />
    : <AlertTriangle className="w-5 h-5" />;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/departments/${departmentId}/staff`)}>
            <ArrowRight className="w-4 h-4 ml-2" />
            كادر المشروع
          </Button>
          <h2 className="text-xl font-bold text-foreground">تفاصيل المشروع</h2>
          <Button variant="outline" onClick={() => navigate(`/departments/${departmentId}/documents`)}>
            الورقيات
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </div>

        {/* Project Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block text-right">اسم المشروع:</label>
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
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block text-right">رقم آخر مستخلص:</label>
            <div className="bg-card border border-border rounded-lg px-4 py-2.5 text-foreground text-center font-bold">
              {project?.last_extract_number || 0}
            </div>
          </div>
        </div>

        {project && (
          <>
            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <Users className="w-4 h-4" />
                  <span>اسم المقاول</span>
                </div>
                <p className="text-lg font-bold text-foreground">{project.contractor_name || "-"}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <Banknote className="w-4 h-4" />
                  <span>قيمة العقد</span>
                </div>
                <p className="text-lg font-bold text-foreground">{Number(project.contract_value).toLocaleString()}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <Users className="w-4 h-4" />
                  <span>عدد العمالة</span>
                </div>
                <p className="text-lg font-bold text-foreground">{project.workers_count || 0}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <Clock className="w-4 h-4" />
                  <span>ساعات العمل</span>
                </div>
                <p className="text-lg font-bold text-foreground">{project.work_hours_weekly || 0}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>المنقضية</span>
                </div>
                <p className="text-lg font-bold text-foreground">{project.elapsed_days}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>المتبقية</span>
                </div>
                <p className="text-lg font-bold text-foreground">{project.remaining_days || 0}</p>
              </div>

              <div className={`rounded-xl border border-border p-4 shadow-sm text-center space-y-2 ${statusColor}`}>
                <div className="flex items-center justify-center gap-2 text-xs opacity-90">
                  {statusIcon}
                  <span>الحالة</span>
                </div>
                <p className="text-xl font-bold">{project.status}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <Banknote className="w-4 h-4" />
                  <span>الغرامات</span>
                </div>
                <p className="text-lg font-bold text-foreground">{Number(project.total_penalties || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm text-center">
                <p className="text-sm text-muted-foreground mb-2">الإنجاز الأسبوعي الفعلي</p>
                <p className="text-3xl font-bold text-primary">{Number(project.weekly_actual_progress || 0).toFixed(3)}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm text-center">
                <p className="text-sm text-muted-foreground mb-2">الإنجاز الأسبوعي المخطط</p>
                <p className="text-3xl font-bold text-chart-green">{Number(project.weekly_planned_progress || 0).toFixed(3)}</p>
              </div>
            </div>

            {/* Activities Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-bold text-foreground text-lg">الأنشطة الرئيسية للمشروع / البنود</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground">
                      <th className="p-4 text-right font-semibold">النشاط</th>
                      <th className="p-4 text-center font-semibold">كمية العقد</th>
                      <th className="p-4 text-center font-semibold">إجمالي المنفذ</th>
                      <th className="p-4 text-center font-semibold">الكمية المتبقية</th>
                      <th className="p-4 text-right font-semibold">اسم الموقع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities && activities.length > 0 ? (
                      activities.map((act: any) => (
                        <tr key={act.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-right text-sm leading-relaxed max-w-xs">{act.description}</td>
                          <td className="p-4 text-center font-medium">{Number(act.contract_quantity).toLocaleString()}</td>
                          <td className="p-4 text-center font-medium">{Number(act.executed_quantity).toLocaleString()}</td>
                          <td className="p-4 text-center font-medium">{Number(act.remaining_quantity).toLocaleString()}</td>
                          <td className="p-4 text-right">{act.location_name || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد أنشطة مسجلة</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
