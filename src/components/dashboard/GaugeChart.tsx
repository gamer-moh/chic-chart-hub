interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
}

const GaugeChart = ({ value, max, label }: GaugeChartProps) => {
  const percentage = (value / max) * 100;
  const angle = (percentage / 100) * 180;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-20 overflow-hidden">
        <svg viewBox="0 0 160 80" className="w-full h-full">
          {/* Track */}
          <path
            d="M 10 75 A 65 65 0 0 1 150 75"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value */}
          <path
            d="M 10 75 A 65 65 0 0 1 150 75"
            fill="none"
            stroke="hsl(var(--chart-teal))"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * 204} 204`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <span className="text-3xl font-bold text-chart-teal">{value.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex justify-between w-full px-2 text-xs text-muted-foreground">
        <span>{max.toLocaleString()}</span>
        <span>0</span>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

export default GaugeChart;
