import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ title, children, className }: DashboardCardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border p-4", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}