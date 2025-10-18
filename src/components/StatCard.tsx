import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard = ({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) => {
  const variantStyles = {
    default: "from-primary/10 to-primary/5",
    success: "from-green-500/10 to-green-500/5",
    warning: "from-accent/10 to-accent/5",
    danger: "from-destructive/10 to-destructive/5",
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-green-600",
    warning: "text-accent",
    danger: "text-destructive",
  };

  return (
    <Card className="overflow-hidden border-none shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", variantStyles[variant])} />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-xl bg-background/50", iconStyles[variant])}>
              <Icon className="h-6 w-6" />
            </div>
            {trend && (
              <span className="text-sm font-medium text-muted-foreground">{trend}</span>
            )}
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};
