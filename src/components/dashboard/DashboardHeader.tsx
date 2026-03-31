import { Building2 } from "lucide-react";

interface DashboardHeaderProps {
  subtitle?: string;
}

const DashboardHeader = ({ subtitle }: DashboardHeaderProps) => {
  return (
    <div className="bg-gradient-to-l from-[hsl(var(--header-gradient-from))] to-[hsl(var(--header-gradient-to))] text-primary-foreground px-8 py-6 rounded-b-2xl shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-foreground/10 backdrop-blur rounded-xl flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm opacity-80">وزارة البلديات والإسكان</p>
            <p className="text-sm opacity-80">أمانة منطقة الباحة</p>
            <p className="text-xs opacity-60">وكالة الصيانة والتشغيل</p>
          </div>
        </div>

        <div className="text-center flex-1">
          <h1 className="text-xl font-bold tracking-wide">
            مشاريع وكالة الصيانة والتشغيل وتحسين المشهد الحضري
          </h1>
          {subtitle && (
            <p className="text-sm opacity-80 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-foreground/10 backdrop-blur rounded-xl flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
