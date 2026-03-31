import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const STAFF_ROLES = [
  "مهندس تصميم", "إجمالي العمالة", "إجمالي الكادر",
  "مهندس زراعي", "مدير المشروع", "مهندس مختبر",
  "سباك", "مهندس لاندسكيب", "ضابط اتصال",
  "كهربائي", "مراقب", "مساح",
];

const ProjectStaff = () => {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  const { data: projects } = useQuery({
    queryKey: ["projects", departmentId],
    queryFn: async () => {
      let query = supabase.from("projects").select("*");
      if (departmentId) query = query.eq("department_id", departmentId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: staffData } = useQuery({
    queryKey: ["project_staff", selectedProjectId],
    queryFn: async () => {
      let query = supabase.from("project_staff").select("*");
      if (selectedProjectId !== "all") {
        query = query.eq("project_id", selectedProjectId);
      } else if (departmentId && projects) {
        const ids = projects.map((p) => p.id);
        if (ids.length > 0) query = query.in("project_id", ids);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!projects,
  });

  const staffByRole = useMemo(() => {
    const map: Record<string, number> = {};
    STAFF_ROLES.forEach((r) => (map[r] = 0));
    staffData?.forEach((s) => {
      map[s.role] = (map[s.role] || 0) + s.count;
    });
    return map;
  }, [staffData]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/departments/${departmentId}`)}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للداشبورد
          </Button>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            كادر المشروع
          </h2>
          <Button variant="outline" onClick={() => navigate(`/departments/${departmentId}/details`)}>
            تفاصيل المشاريع
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </div>

        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-full bg-card">
            <SelectValue placeholder="اسم المشروع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المشاريع</SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {STAFF_ROLES.map((role) => {
            const isTotal = role.includes("إجمالي");
            return (
              <div
                key={role}
                className={`rounded-xl border p-5 text-center shadow-sm ${
                  isTotal
                    ? "bg-gradient-to-l from-[hsl(var(--header-gradient-from))] to-[hsl(var(--header-gradient-to))] text-primary-foreground border-transparent"
                    : "bg-card border-border"
                }`}
              >
                <p className={`text-sm font-bold mb-2 ${isTotal ? "" : "text-foreground"}`}>
                  {role}
                </p>
                <p className={`text-3xl font-bold ${isTotal ? "" : "text-primary"}`}>
                  {staffByRole[role] || 0}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectStaff;
