import { DashboardCard } from "../DashboardCard";
import { HealthGoal } from "../HealthGoal";
import { DateTabs, dateRanges } from "./DateTabs";
import { Goal } from "@/types/goals";
import { format } from "date-fns";

interface GoalsOverviewProps {
  goals: Goal[];
}

export function GoalsOverview({ goals }: GoalsOverviewProps) {
  return (
    <DashboardCard title="Recent Goals" className="h-full">
      <DateTabs>
        {(range) => {
          const formattedDate = format(range.date, 'yyyy-MM-dd');
          const filteredGoals = goals.filter(
            goal => goal.progress_date === formattedDate
          );

          return (
            <div className="space-y-4">
              {filteredGoals.map((goal) => (
                <HealthGoal
                  key={goal.id}
                  title={`Daily ${goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}`}
                  description={`${(goal.current_value || 0).toLocaleString()} / ${goal.target_value.toLocaleString()} ${goal.unit}`}
                  completed={(goal.current_value || 0) >= goal.target_value}
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