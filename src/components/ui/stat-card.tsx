import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const StatCard = ({ title, value, icon: Icon, description, trend }: StatCardProps) => {
  return (
    <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-6 hover:glass-card-elevated transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between mb-2 md:mb-4">
        <div className="p-1.5 md:p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="w-4 h-4 md:w-6 md:h-6 text-primary" />
        </div>
        {trend && (
          <span className={`text-[10px] md:text-sm font-medium ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      <h3 className="text-lg md:text-2xl font-display font-bold text-foreground mb-0.5 md:mb-1 truncate">{value}</h3>
      <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">{title}</p>
      {description && (
        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2 hidden sm:block truncate">{description}</p>
      )}
    </div>
  );
};
