import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  FolderOpen,
  Banknote,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import ProgressRing from "@/components/dashboard/ProgressRing";
import GaugeChart from "@/components/dashboard/GaugeChart";
import ProjectsBarChart from "@/components/dashboard/ProjectsBarChart";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import ProjectMap from "@/components/dashboard/ProjectMap";
import {
  useProjects,
  useAllLocations,
  useDeleteProject,
  type Project,
} from "@/hooks/useProjects";

const Index = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const { data: allLocations } = useAllLocations();
  const deleteProject = useDeleteProject();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  const selectedProject = useMemo(() => {
    if (selectedProjectId === "all" || !projects) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        totalValue: 0,
        totalProjects: 0,
        startDate: "-",
        endDate: "-",
        duration: 0,
        elapsed: 0,
        avgProgress: 0,
        status: "-",
      };
    }

    if (selectedProject) {
      const p = selectedProject;
      return {
        totalValue: p.contract_value,
        totalProjects: 1,
        startDate: p.start_date,
        endDate: p.end_date,
        duration: p.duration_days,
        elapsed: p.elapsed_days,
        avgProgress: p.actual_progress,
        status: p.status,
      };
    }

    const totalValue = projects.reduce((s, p) => s + Number(p.contract_value), 0);
    const dates = projects.map((p) => new Date(p.start_date).getTime());
    const endDates = projects.map((p) => new Date(p.end_date).getTime());
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...endDates));
    const totalDuration = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));
    const avgElapsed = Math.round(projects.reduce((s, p) => s + p.elapsed_days, 0) / projects.length);
    const avgProgress = Number((projects.reduce((s, p) => s + Number(p.actual_progress), 0) / projects.length).toFixed(2));

    return {
      totalValue,
      totalProjects: projects.length,
      startDate: earliest.toISOString().split("T")[0],
      endDate: latest.toISOString().split("T")[0],
      duration: totalDuration,
      elapsed: avgElapsed,
      avgProgress,
      status: projects.every((p) => p.status === "على المسار") ? "على المسار" : "يوجد تأخير",
    };
  }, [projects, selectedProject]);

  const filteredLocations = useMemo(() => {
    if (!allLocations) return [];
    if (selectedProjectId === "all") return allLocations;
    return allLocations.filter((l) => l.project_id === selectedProjectId);
  }, [allLocations, selectedProjectId]);

  const projectNames = useMemo(() => {
    if (!projects) return {};
    return Object.fromEntries(projects.map((p) => [p.id, p.name]));
  }, [projects]);

  const elapsedPercentage = stats.duration > 0
    ? Number(((stats.elapsed / stats.duration) * 100).toFixed(0))
    : 0;

  const statusIcon = stats.status === "على المسار"
    ? <CheckCircle className="w-5 h-5 text-chart-green" />
    : <AlertTriangle className="w-5 h-5 text-chart-orange" />;

  const handleDelete = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      if (selectedProjectId === id) setSelectedProjectId("all");
      toast.success("تم حذف المشروع");
    } catch {
      toast.error("خطأ في حذف المشروع");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-80 bg-card">
              <SelectValue placeholder="اختر المشروع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المشاريع</SelectItem>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => navigate("/projects/new")} className="mr-auto">
            <Plus className="w-4 h-4 ml-2" />
            إضافة مشروع
          </Button>

          {selectedProject && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(selectedProject.id)}
            >
              <Trash2 className="w-4 h-4 ml-1" />
              حذف
            </Button>
          )}
        </div>

        {(!projects || projects.length === 0) ? (
          <div className="bg-card rounded-xl border border-border p-16 text-center space-y-4 shadow-sm">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">لا توجد مشاريع بعد</p>
            <Button onClick={() => navigate("/projects/new")}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة مشروع جديد
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                label="تاريخ البداية"
                value={stats.startDate}
                icon={<Calendar className="w-4 h-4" />}
                accent
              />
              <StatCard
                label="تاريخ النهاية"
                value={stats.endDate}
                icon={<Calendar className="w-4 h-4" />}
                accent
              />
              <StatCard
                label="المدة (يوم)"
                value={stats.duration.toLocaleString()}
                icon={<Clock className="w-4 h-4" />}
              />
              <StatCard
                label="عدد المشاريع"
                value={stats.totalProjects}
                icon={<FolderOpen className="w-4 h-4" />}
              />
              <StatCard
                label="إجمالي القيمة (ر.س)"
                value={stats.totalValue.toLocaleString()}
                icon={<Banknote className="w-4 h-4" />}
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-4 shadow-sm">
              {statusIcon}
              <span className="text-sm font-medium text-muted-foreground">حالة تقدم المشروع:</span>
              <span className={`text-lg font-bold ${stats.status === "على المسار" ? "text-chart-green" : "text-chart-orange"}`}>
                {stats.status}
              </span>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-base font-bold text-foreground mb-6">المدة المنقضية بالأيام</h3>
                <GaugeChart value={stats.elapsed} max={stats.duration} label="يوم منقضي" />
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-base font-bold text-foreground mb-6">حالة تقدم المشروع</h3>
                <ProgressRing
                  percentage={stats.avgProgress}
                  label="الإنجاز الفعلي التراكمي"
                  color="hsl(var(--chart-teal))"
                />
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-chart-teal inline-block" />
                    <span>الإنجاز {stats.avgProgress}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-chart-orange inline-block" />
                    <span>المتبقي {(100 - stats.avgProgress).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-base font-bold text-foreground mb-6">نسبة المدة المنقضية</h3>
                <ProgressRing
                  percentage={elapsedPercentage}
                  label="نسبة المدة المنقضية"
                  color="hsl(var(--chart-green))"
                />
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-chart-green inline-block" />
                    <span>المنقضية {elapsedPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-muted inline-block" />
                    <span>المتبقية {100 - elapsedPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-4">خريطة مواقع المشاريع</h3>
              {filteredLocations.length > 0 ? (
                <ProjectMap
                  locations={filteredLocations}
                  projectNames={projectNames}
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <MapPin className="w-5 h-5 ml-2" />
                  لا توجد مواقع مسجلة
                </div>
              )}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProjectsBarChart
                  projects={selectedProject ? [selectedProject] : projects}
                />
              </div>
              <div>
                <ProjectsTable
                  projects={selectedProject ? [selectedProject] : projects}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export default Index;
