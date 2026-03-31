import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-bl from-[hsl(200,50%,18%)] via-[hsl(195,65%,25%)] to-[hsl(165,60%,30%)]">
      {/* Decorative geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-primary-foreground/20 rotate-45"
              style={{
                width: `${80 + i * 60}px`,
                height: `${80 + i * 60}px`,
                top: `${10 + i * 15}%`,
                right: `${5 + i * 8}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Top bar with logos */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-primary-foreground/10 backdrop-blur rounded-xl flex items-center justify-center border border-primary-foreground/20">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="text-primary-foreground text-sm">
            <p className="font-bold">رؤية 2030</p>
            <p className="opacity-70 text-xs">المملكة العربية السعودية</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-primary-foreground text-left text-sm">
            <p className="font-bold">وزارة البلديات والإسكان</p>
            <p className="opacity-70 text-xs">Ministry of Municipalities and Housing</p>
          </div>
          <div className="w-14 h-14 bg-primary-foreground/10 backdrop-blur rounded-xl flex items-center justify-center border border-primary-foreground/20">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-primary-foreground/10 backdrop-blur rounded-2xl flex items-center justify-center border border-primary-foreground/20">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="text-primary-foreground text-right">
            <p className="text-lg font-bold">أمانة منطقة الباحة</p>
            <p className="text-sm opacity-70">ALBAHA MUNICIPALITY</p>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 leading-relaxed">
          وكالة الصيانة والتشغيل
          <br />
          وتحسين المشهد الحضري
        </h1>

        <p className="text-primary-foreground/70 text-lg mb-12 max-w-xl">
          نظام متابعة ومراقبة مشاريع الصيانة والتشغيل
        </p>

        <Button
          onClick={() => navigate("/org-structure")}
          size="lg"
          className="bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border border-primary-foreground/30 backdrop-blur px-12 py-6 text-xl rounded-xl transition-all duration-300 hover:scale-105"
        >
          البدء
        </Button>
      </div>

      {/* Bottom decorative */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent" />
    </div>
  );
};

export default Landing;
