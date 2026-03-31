import { Calendar, Clock, FolderOpen, Banknote, CheckCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import ProgressRing from "@/components/dashboard/ProgressRing";
import GaugeChart from "@/components/dashboard/GaugeChart";
import ProjectsBarChart from "@/components/dashboard/ProjectsBarChart";
import ProjectsTable from "@/components/dashboard/ProjectsTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="تاريخ بداية المشروع"
            value="01/01/2023"
            icon={<Calendar className="w-4 h-4" />}
            accent
          />
          <StatCard
            label="تاريخ نهاية المشروع"
            value="12/31/2025"
            icon={<Calendar className="w-4 h-4" />}
            accent
          />
          <StatCard
            label="مدة المشروع (يوم)"
            value="1,205"
            icon={<Clock className="w-4 h-4" />}
          />
          <StatCard
            label="عدد مشاريع الإدارة"
            value="3"
            icon={<FolderOpen className="w-4 h-4" />}
          />
          <StatCard
            label="إجمالي قيمة مشاريع الوكالة"
            value="28,829,193"
            icon={<Banknote className="w-4 h-4" />}
          />
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-4 shadow-sm">
          <CheckCircle className="w-5 h-5 text-chart-green" />
          <span className="text-sm font-medium text-muted-foreground">حالة تقدم المشروع:</span>
          <span className="text-lg font-bold text-chart-green">على المسار</span>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gauge */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-foreground mb-6">المدة المنقضية بالأيام</h3>
            <GaugeChart value={1126} max={1205} label="يوم منقضي" />
          </div>

          {/* Project Progress */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-foreground mb-6">حالة تقدم المشروع</h3>
            <ProgressRing
              percentage={93.43}
              label="الإنجاز الفعلي التراكمي"
              color="hsl(var(--chart-teal))"
            />
            <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-chart-teal inline-block" />
                <span>الإنجاز الفعلي 93.43%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-chart-orange inline-block" />
                <span>المتبقي 6.57%</span>
              </div>
            </div>
          </div>

          {/* Time Elapsed */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-foreground mb-6">نسبة المدة المنقضية</h3>
            <ProgressRing
              percentage={21}
              label="نسبة المدة المتبقية"
              color="hsl(var(--chart-green))"
            />
            <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-chart-green inline-block" />
                <span>المنقضية 21%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-muted inline-block" />
                <span>المتبقية 79%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProjectsBarChart />
          </div>
          <div>
            <ProjectsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
