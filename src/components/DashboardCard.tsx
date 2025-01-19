import { cn } from "@/lib/utils";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

export function DashboardCard({ title, children, className, ...props }: DashboardCardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border p-4", className)} {...props}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}