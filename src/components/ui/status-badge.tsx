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
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      variants[status]
    )}>
      <span>{icons[status]}</span>
      {labels[status]}
    </span>
  );
};
