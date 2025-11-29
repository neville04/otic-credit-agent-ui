import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const SectionCard = ({ title, description, children, className = "" }: SectionCardProps) => {
  return (
    <div className={`glass-card rounded-xl p-6 animate-slide-up ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold text-foreground mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};
