import { DashboardCard } from "../DashboardCard";
import { HealthMetric } from "../HealthMetric";
import { DateTabs, dateRanges } from "./DateTabs";
import { Goal } from "@/types/goals";
import { format } from "date-fns";

interface QuickStatsProps {
  goals: Goal[];
  onUpdate: () => void;
}

export function QuickStats({ goals, onUpdate }: QuickStatsProps) {
  return (
    <DashboardCard title="Quick Stats" className="h-full">
      <DateTabs>
        {(range) => {
          const formattedDate = format(range.date, 'yyyy-MM-dd');
          const filteredGoals = goals.filter(
            goal => goal.progress_date === formattedDate
          );

          return (
            <div className="space-y-6">
              {filteredGoals.map((goal) => (
                <HealthMetric
                  key={goal.id}
                  label={`${goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)} Today`}
                  value={goal.current_value || 0}
                  target={goal.target_value}
                  unit={goal.unit}
                  goalId={goal.id}
                  onUpdate={onUpdate}
                />
              ))}
              {filteredGoals.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No goals for this date</p>
              )}
            </div>
          );
        }}
      </DateTabs>
    </DashboardCard>
  );
}