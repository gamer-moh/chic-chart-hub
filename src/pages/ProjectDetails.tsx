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
import StatCard from "@/components/dashboard/StatCard";
import { Banknote, Users, Clock, Calendar, CheckCircle, AlertTriangle } from "lucide-react";

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const { data: projects } = useQuery({
    queryKey: ["projects", departmentId],
    queryFn: async () => {
      let query = supabase.from("projects").select("*");
      if (departmentId) query = query.eq("department_id", departmentId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const project = projects?.find((p) => p.id === selectedProjectId);

  const { data: activities } = useQuery({
    queryKey: ["project_activities", selectedProjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_activities")
        .select("*")
        .eq("project_id", selectedProjectId);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProjectId,
  });

  // Auto-select first project
  if (!selectedProjectId && projects && projects.length > 0) {
    setSelectedProjectId(projects[0].id);
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
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

        {/* Project selector and extract number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">اسم المشروع:</label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="اختر المشروع" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">رقم آخر مستخلص:</label>
            <div className="bg-card border border-border rounded-lg px-4 py-2 text-foreground">
              {project?.last_extract_number || 0}
            </div>
          </div>
        </div>

        {project && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <StatCard label="اسم المقاول" value={project.contractor_name || "-"} icon={<Users className="w-4 h-4" />} />
              <StatCard label="قيمة العقد" value={Number(project.contract_value).toLocaleString()} icon={<Banknote className="w-4 h-4" />} />
              <StatCard label="عدد العمالة" value={project.workers_count || 0} icon={<Users className="w-4 h-4" />} />
              <StatCard label="ساعات العمل الأسبوعية" value={project.work_hours_weekly || 0} icon={<Clock className="w-4 h-4" />} />
              <StatCard label="المدة المنقضية" value={project.elapsed_days} icon={<Calendar className="w-4 h-4" />} />
              <StatCard label="المدة المتبقية" value={project.remaining_days || 0} icon={<Calendar className="w-4 h-4" />} />
              <StatCard
                label="الحالة"
                value={project.status}
                icon={project.status === "على المسار"
                  ? <CheckCircle className="w-4 h-4 text-chart-green" />
                  : <AlertTriangle className="w-4 h-4 text-chart-orange" />}
                accent={project.status === "على المسار"}
              />
              <StatCard label="إجمالي الغرامات" value={Number(project.total_penalties || 0).toLocaleString()} icon={<Banknote className="w-4 h-4" />} />
            </div>

            {/* Weekly progress */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">الإنجاز الأسبوعي الفعلي</p>
                  <p className="text-2xl font-bold text-primary">{Number(project.weekly_actual_progress || 0).toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الإنجاز الأسبوعي المخطط</p>
                  <p className="text-2xl font-bold text-chart-green">{Number(project.weekly_planned_progress || 0).toFixed(3)}</p>
                </div>
              </div>
            </div>

            {/* Activities table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">الأنشطة الرئيسية للمشروع / البنود</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground">
                      <th className="p-3 text-right">النشاط</th>
                      <th className="p-3 text-center">كمية العقد</th>
                      <th className="p-3 text-center">إجمالي المنفذ</th>
                      <th className="p-3 text-center">الكمية المتبقية</th>
                      <th className="p-3 text-right">اسم الموقع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities && activities.length > 0 ? (
                      activities.map((act) => (
                        <tr key={act.id} className="border-t border-border hover:bg-muted/30">
                          <td className="p-3 text-right text-xs leading-relaxed max-w-xs">{act.description}</td>
                          <td className="p-3 text-center">{Number(act.contract_quantity)}</td>
                          <td className="p-3 text-center">{Number(act.executed_quantity)}</td>
                          <td className="p-3 text-center">{Number(act.remaining_quantity)}</td>
                          <td className="p-3 text-right">{act.location_name || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          لا توجد أنشطة مسجلة
                        </td>
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
