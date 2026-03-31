import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import type { Project } from "@/hooks/useProjects";

interface ProjectsBarChartProps {
  projects: Project[];
}

const ProjectsBarChart = ({ projects }: ProjectsBarChartProps) => {
  const data = projects.map((p) => ({
    name: p.name.length > 30 ? p.name.slice(0, 30) + "..." : p.name,
    total: p.duration_days,
    elapsed: p.elapsed_days,
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="text-base font-bold text-foreground mb-6">الموقف العام للمشاريع</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barGap={8} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "'IBM Plex Sans Arabic'",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "'IBM Plex Sans Arabic'" }} />
          <Bar dataKey="total" name="عمر المشروع" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill="hsl(var(--chart-teal))" />
            ))}
          </Bar>
          <Bar dataKey="elapsed" name="المدة المنقضية" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill="hsl(var(--chart-orange))" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectsBarChart;
