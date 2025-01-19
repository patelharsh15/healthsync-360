import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthGoalProps {
  title: string;
  description: string;
  completed?: boolean;
  className?: string;
}

export function HealthGoal({ title, description, completed = false, className }: HealthGoalProps) {
  return (
    <div className={cn("flex items-start space-x-4 p-4 rounded-lg bg-white", className)}>
      <div className={cn("rounded-full p-2", completed ? "bg-primary-100" : "bg-secondary")}>
        {completed ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <X className="h-4 w-4 text-primary" />
        )}
      </div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}