import ministryLogo from "@/assets/ministry.png";
import albahaLogo from "@/assets/albaha-header.png";
import vision2030 from "@/assets/vision2030.png";

interface DashboardHeaderProps {
  subtitle?: string;
}

const DashboardHeader = ({ subtitle }: DashboardHeaderProps) => {
  return (
    <div className="bg-gradient-to-l from-[hsl(var(--header-gradient-from))] to-[hsl(var(--header-gradient-to))] text-primary-foreground px-8 py-6 rounded-b-2xl shadow-lg">
      <div className="flex items-center justify-between">
        {/* Right side: Ministry + Albaha logos */}
        <div className="flex items-center gap-3">
          <img src={ministryLogo} alt="وزارة البلديات والإسكان" className="h-14 md:h-16 w-auto object-contain drop-shadow-md" />
          <img src={albahaLogo} alt="أمانة منطقة الباحة" className="h-14 md:h-16 w-auto object-contain drop-shadow-md" />
        </div>

        <div className="text-center flex-1 px-4">
          <h1 className="text-xl font-bold tracking-wide">
            مشاريع وكالة الصيانة والتشغيل وتحسين المشهد الحضري
          </h1>
          {subtitle && (
            <p className="text-sm opacity-80 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Left side: Vision 2030 */}
        <div className="flex items-center">
          <img src={vision2030} alt="رؤية 2030" className="h-14 md:h-16 w-auto object-contain drop-shadow-md" />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
