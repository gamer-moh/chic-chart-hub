import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const data = [
  {
    name: "نظافة مباني الأمانة",
    total: 1205,
    elapsed: 1126,
  },
  {
    name: "عقد أداء صيانة المباني والمرافق",
    total: 1095,
    elapsed: 973,
  },
  {
    name: "مشروع صيانة مقابر الأمانة",
    total: 986,
    elapsed: 210,
  },
];

const ProjectsBarChart = () => {
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
          <Legend
            wrapperStyle={{ fontSize: "12px", fontFamily: "'IBM Plex Sans Arabic'" }}
          />
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
