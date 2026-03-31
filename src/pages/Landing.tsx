import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import albahLogo from "@/assets/albaha-municipality.png";

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

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 text-center">
        <img src={albahLogo} alt="أمانة منطقة الباحة" className="h-28 md:h-36 w-auto object-contain drop-shadow-xl mb-6" />

        <p className="text-xl md:text-2xl font-bold text-primary-foreground mb-1">أمانة منطقة الباحة</p>
        <p className="text-sm text-primary-foreground/70 mb-8">ALBAHA MUNICIPALITY</p>

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
