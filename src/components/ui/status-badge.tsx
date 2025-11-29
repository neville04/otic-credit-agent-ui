import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "connected" | "disconnected" | "error";
  label?: string;
}

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const variants = {
    connected: "bg-green-500/10 text-green-400 border-green-500/20",
    disconnected: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  const icons = {
    connected: "✓",
    disconnected: "⚠",
    error: "✕"
  };

  const labels = {
    connected: label || "Connected",
    disconnected: label || "Not Connected",
    error: label || "Error"
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium border whitespace-nowrap",
      variants[status]
    )}>
      <span className="text-xs md:text-sm">{icons[status]}</span>
      <span className="hidden sm:inline">{labels[status]}</span>
    </span>
  );
};
