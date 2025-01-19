import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const DashboardCard = ({ children, className, title }: DashboardCardProps) => {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-sm", className)}>
      {title && (
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
};