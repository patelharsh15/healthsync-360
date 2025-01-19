import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardCard = ({ children, className }: DashboardCardProps) => {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-sm", className)}>
      {children}
    </div>
  );
};

export default DashboardCard;