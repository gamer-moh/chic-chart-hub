import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, ArrowLeft, ChevronLeft, Route, Wrench, FlaskConical, Lightbulb, Headset, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ReactNode> = {
  road: <Route className="w-8 h-8" />,
  wrench: <Wrench className="w-8 h-8" />,
  "flask-conical": <FlaskConical className="w-8 h-8" />,
  lightbulb: <Lightbulb className="w-8 h-8" />,
  headset: <Headset className="w-8 h-8" />,
};

const Departments = () => {
  const navigate = useNavigate();
  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-l from-[hsl(var(--header-gradient-from))] to-[hsl(var(--header-gradient-to))] text-primary-foreground px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/org-structure")}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            هيكل الوكالة
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">وكالة الصيانة والتشغيل وتحسين المشهد الحضري</h1>
            <p className="text-sm opacity-70 mt-1">الإدارات</p>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="text-center text-muted-foreground animate-pulse py-20">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments?.map((dept: any) => (
              <button
                key={dept.id}
                onClick={() => navigate(`/departments/${dept.id}`)}
                className="group bg-card rounded-2xl border border-border p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 text-right"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    {iconMap[dept.icon] || <Building2 className="w-8 h-8" />}
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mr-auto" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{dept.name}</h3>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
