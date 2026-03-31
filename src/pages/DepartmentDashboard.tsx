import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar, Clock, FolderOpen, Banknote, CheckCircle, AlertTriangle, Plus, Trash2, MapPin, ArrowRight, ArrowLeft, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import ProgressRing from "@/components/dashboard/ProgressRing";
import GaugeChart from "@/components/dashboard/GaugeChart";
import ProjectsBarChart from "@/components/dashboard/ProjectsBarChart";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import ProjectMap from "@/components/dashboard/ProjectMap";
import { useAllLocations, useDeleteProject } from "@/hooks/useProjects";

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const { user } = useAuth();
  const deleteProject = useDeleteProject();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  const { data: department } = useQuery({
    queryKey: ["department", departmentId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("departments" as any).select("*") as any).eq("id", departmentId!).single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!departmentId,
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["dept_projects", departmentId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("projects").select("*") as any)
        .eq("department_id", departmentId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!departmentId,
  });

  const { data: allLocations } = useAllLocations();

  const selectedProject = useMemo(() => {
    if (selectedProjectId === "all" || !projects) return null;
    return projects.find((p: any) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  const stats = useMemo(() => {
    if (!projects || projects.length === 0) {
      return { totalValue: 0, totalProjects: 0, startDate: "-", endDate: "-", duration: 0, elapsed: 0, avgProgress: 0, status: "-" };
    }
    if (selectedProject) {
      const p = selectedProject as any;
      return { totalValue: p.contract_value, totalProjects: 1, startDate: p.start_date, endDate: p.end_date, duration: p.duration_days, elapsed: p.elapsed_days, avgProgress: p.actual_progress, status: p.status };
    }
    const totalValue = projects.reduce((s: number, p: any) => s + Number(p.contract_value), 0);
    const dates = projects.map((p: any) => new Date(p.start_date).getTime());
    const endDates = projects.map((p: any) => new Date(p.end_date).getTime());
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...endDates));
    const totalDuration = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));
    const avgElapsed = Math.round(projects.reduce((s: number, p: any) => s + p.elapsed_days, 0) / projects.length);
    const avgProgress = Number((projects.reduce((s: number, p: any) => s + Number(p.actual_progress), 0) / projects.length).toFixed(2));
    return {
      totalValue, totalProjects: projects.length,
      startDate: earliest.toISOString().split("T")[0], endDate: latest.toISOString().split("T")[0],
      duration: totalDuration, elapsed: avgElapsed, avgProgress,
      status: projects.every((p: any) => p.status === "على المسار") ? "على المسار" : "يوجد تأخير",
    };
  }, [projects, selectedProject]);

  const filteredLocations = useMemo(() => {
    if (!allLocations || !projects) return [];
    const projectIds = projects.map((p: any) => p.id);
    let locs = allLocations.filter((l: any) => projectIds.includes(l.project_id));
    if (selectedProjectId !== "all") locs = locs.filter((l: any) => l.project_id === selectedProjectId);
    return locs;
  }, [allLocations, projects, selectedProjectId]);

  const projectNames = useMemo(() => {
    if (!projects) return {};
    return Object.fromEntries(projects.map((p: any) => [p.id, p.name]));
  }, [projects]);

  const elapsedPercentage = stats.duration > 0 ? Number(((stats.elapsed / stats.duration) * 100).toFixed(0)) : 0;
  const statusIcon = stats.status === "على المسار" ? <CheckCircle className="w-5 h-5 text-chart-green" /> : <AlertTriangle className="w-5 h-5 text-chart-orange" />;

  const handleDelete = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      if (selectedProjectId === id) setSelectedProjectId("all");
      toast.success("تم حذف المشروع");
    } catch { toast.error("خطأ في حذف المشروع"); }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">جاري التحميل...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader subtitle={department?.name} />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate("/departments")}>
            <ArrowRight className="w-4 h-4 ml-2" />
            الإدارات
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/departments/${departmentId}/documents`)}>
              <FileText className="w-4 h-4 ml-2" />
              الورقيات
            </Button>
            <Button variant="outline" onClick={() => navigate(`/departments/${departmentId}/details`)}>
              تفاصيل المشاريع
            </Button>
            <Button variant="outline" onClick={() => navigate(`/departments/${departmentId}/staff`)}>
              كادر المشروع
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-80 bg-card"><SelectValue placeholder="اختر المشروع" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المشاريع</SelectItem>
              {projects?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {user && (
            <Button 
              onClick={() => navigate(`/departments/${departmentId}/projects/new`)} 
              className="mr-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-6 py-3 text-base font-bold animate-pulse hover:animate-none transition-all"
              size="lg"
            >
              <Plus className="w-5 h-5 ml-2" />
              ➕ إضافة مشروع جديد
            </Button>
          )}

          {user && selectedProject && (
            <Button variant="destructive" size="sm" onClick={() => handleDelete((selectedProject as any).id)}>
              <Trash2 className="w-4 h-4 ml-1" /> حذف
            </Button>
          )}
        </div>

        {(!projects || projects.length === 0) ? (
          <div className="bg-card rounded-xl border border-border p-16 text-center space-y-4 shadow-sm">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">لا توجد مشاريع بعد</p>
            {user && (
              <Button onClick={() => navigate(`/departments/${departmentId}/projects/new`)}>
                <Plus className="w-4 h-4 ml-2" /> إضافة مشروع جديد
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="تاريخ البداية" value={stats.startDate} icon={<Calendar className="w-4 h-4" />} accent />
              <StatCard label="تاريخ النهاية" value={stats.endDate} icon={<Calendar className="w-4 h-4" />} accent />
              <StatCard label="المدة (يوم)" value={stats.duration.toLocaleString()} icon={<Clock className="w-4 h-4" />} />
              <StatCard label="عدد المشاريع" value={stats.totalProjects} icon={<FolderOpen className="w-4 h-4" />} />
              <StatCard label="إجمالي القيمة (ر.س)" value={stats.totalValue.toLocaleString()} icon={<Banknote className="w-4 h-4" />} />
            </div>

            <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-4 shadow-sm">
              {statusIcon}
              <span className="text-sm font-medium text-muted-foreground">حالة تقدم المشروع:</span>
              <span className={`text-lg font-bold ${stats.status === "على المسار" ? "text-chart-green" : "text-chart-orange"}`}>{stats.status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-base font-bold text-foreground mb-6">المدة المنقضية بالأيام</h3>
                <GaugeChart value={stats.elapsed} max={stats.duration} label="يوم منقضي" />
              </div>
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-base font-bold text-foreground mb-6">حالة تقدم المشروع</h3>
                <ProgressRing percentage={stats.avgProgress} label="الإنجاز الفعلي التراكمي" color="hsl(var(--chart-teal))" />
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-chart-teal inline-block" /><span>الإنجاز {stats.avgProgress}%</span></div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-chart-orange inline-block" /><span>المتبقي {(100 - stats.avgProgress).toFixed(2)}%</span></div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-base font-bold text-foreground mb-6">نسبة المدة المنقضية</h3>
                <ProgressRing percentage={elapsedPercentage} label="نسبة المدة المنقضية" color="hsl(var(--chart-green))" />
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-chart-green inline-block" /><span>المنقضية {elapsedPercentage}%</span></div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-muted inline-block" /><span>المتبقية {100 - elapsedPercentage}%</span></div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-4">خريطة مواقع المشاريع</h3>
              {filteredLocations.length > 0 ? (
                <ProjectMap locations={filteredLocations} projectNames={projectNames} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <MapPin className="w-5 h-5 ml-2" /> لا توجد مواقع مسجلة
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProjectsBarChart projects={selectedProject ? [selectedProject] : projects} />
              </div>
              <div>
                <ProjectsTable projects={selectedProject ? [selectedProject] : projects} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentDashboard;
