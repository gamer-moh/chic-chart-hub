interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: boolean;
}

const StatCard = ({ label, value, icon, accent }: StatCardProps) => {
  return (
    <div className={`rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${
      accent
        ? "bg-gradient-to-bl from-[hsl(var(--header-gradient-from))] to-[hsl(var(--header-gradient-to))] text-primary-foreground border-transparent"
        : "bg-card text-card-foreground border-border"
    }`}>
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className={accent ? "opacity-80" : "text-primary"}>{icon}</span>}
        <span className={`text-xs font-medium ${accent ? "opacity-80" : "text-muted-foreground"}`}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold animate-count-up">{value}</p>
    </div>
  );
};

export default StatCard;
