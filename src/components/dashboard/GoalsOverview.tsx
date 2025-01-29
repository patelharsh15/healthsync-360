import { DashboardCard } from "../DashboardCard";
import { HealthGoal } from "../HealthGoal";
import { DateTabs, dateRanges } from "./DateTabs";
import { Goal } from "@/types/goals";

interface GoalsOverviewProps {
  goals: Goal[];
}

export function GoalsOverview({ goals }: GoalsOverviewProps) {
  return (
    <DashboardCard title="Recent Goals" className="h-full">
      <DateTabs>
        {() => (
          <div className="space-y-4">
            {goals.map((goal) => (
              <HealthGoal
                key={goal.id}
                title={`Daily ${goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}`}
                description={`${(goal.current_value || 0).toLocaleString()} / ${goal.target_value.toLocaleString()} ${goal.unit}`}
                completed={(goal.current_value || 0) >= goal.target_value}
              />
            ))}
            {goals.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No goals set yet</p>
            )}
          </div>
        )}
      </DateTabs>
    </DashboardCard>
  );
}