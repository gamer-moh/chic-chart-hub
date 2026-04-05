import vision2030 from "@/assets/vision2030.png";
import ministryLogo from "@/assets/ministry.png";
import albahaLogo from "@/assets/albaha-municipality.png";

const Closing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-bl from-[hsl(var(--header-gradient-from))] via-[hsl(195,65%,25%)] to-[hsl(165,60%,30%)] flex flex-col items-center justify-center text-primary-foreground">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-primary-foreground/20 rounded-full"
            style={{
              width: `${120 + i * 80}px`,
              height: `${120 + i * 80}px`,
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${1 + i * 0.3})`,
            }}
          />
        ))}
      </div>

      {/* Logos Row */}
      <div className="relative z-10 flex items-center justify-center gap-12 mb-12">
        <img src={vision2030} alt="رؤية 2030" className="h-20 md:h-24 w-auto object-contain drop-shadow-xl" />
        <img src={albahaLogo} alt="أمانة منطقة الباحة" className="h-24 md:h-28 w-auto object-contain drop-shadow-xl" />
        <img src={ministryLogo} alt="وزارة البلديات والإسكان" className="h-20 md:h-24 w-auto object-contain drop-shadow-xl" />
      </div>

      {/* Title */}
      <div className="relative z-10 text-center space-y-4 mb-16">
        <h1 className="text-3xl md:text-4xl font-bold leading-relaxed">
          أمانة منطقة الباحة
        </h1>
        <p className="text-xl md:text-2xl opacity-90">
          وكالة الصيانة والتشغيل وتحسين المشهد الحضري
        </p>
        <div className="w-24 h-0.5 bg-primary-foreground/40 mx-auto mt-6" />
        <p className="text-lg opacity-70 mt-4">
          نظام متابعة ومراقبة المشاريع
        </p>
      </div>

      {/* Thank you */}
      <div className="relative z-10 text-center mb-16">
        <p className="text-2xl md:text-3xl font-bold opacity-90">
          شكراً لكم
        </p>
      </div>

      {/* Developer Signature */}
      <div className="relative z-10 mt-auto pb-8 text-center">
        <div className="inline-block border-t border-primary-foreground/30 pt-4 px-8">
          <p className="text-sm opacity-60 mb-1">المطور</p>
          <p className="text-lg font-bold">م/ م. قمر</p>
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent" />
    </div>
  );
};

export default Closing;
