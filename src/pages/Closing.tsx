import vision2030 from "@/assets/vision2030.png";
import ministryLogo from "@/assets/ministry.png";
import albahLogo from "@/assets/albaha-municipality.png";

const Closing = () => {
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
      <div className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6">
        <img src={vision2030} alt="رؤية 2030" className="h-16 md:h-20 w-auto object-contain drop-shadow-lg" />
        <img src={ministryLogo} alt="وزارة البلديات والإسكان" className="h-16 md:h-20 w-auto object-contain drop-shadow-lg" />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[75vh] px-8 text-center">
        <img src={albahLogo} alt="أمانة منطقة الباحة" className="h-32 md:h-40 w-auto object-contain drop-shadow-xl mb-10" />

        <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 leading-relaxed">
          وكالة الصيانة والتشغيل
          <br />
          وتحسين المشهد الحضري
        </h1>

        <p className="text-primary-foreground/70 text-lg mb-8 max-w-xl">
          نظام متابعة ومراقبة مشاريع الصيانة والتشغيل
        </p>

        {/* Thank you */}
        <p className="text-2xl md:text-3xl font-bold text-primary-foreground/90 mb-12">
          شكراً لكم
        </p>

        {/* Developer Signature */}
        <div className="border-t border-primary-foreground/30 pt-4 px-8">
          <p className="text-sm text-primary-foreground/60 mb-1">المطور</p>
          <p className="text-lg font-bold text-primary-foreground">م/ م. قمر</p>
        </div>
      </div>

      {/* Bottom decorative */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent" />
    </div>
  );
};

export default Closing;
