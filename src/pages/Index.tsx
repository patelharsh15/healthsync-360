import { DashboardCard } from "@/components/DashboardCard";
import { HealthMetric } from "@/components/HealthMetric";
import { HealthGoal } from "@/components/HealthGoal";
import { HealthDataIntegrations } from "@/components/HealthDataIntegrations";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, Utensils, Mic, MessageSquare, Edit2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GoalSettingForm } from "@/components/GoalSettingForm";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Goal {
  id: string;
  goal_type: "steps" | "water" | "sleep";
  target_value: number;
  current_value: number | null;
  unit: string;
  created_at: string;
  progress_date: string;
}

const ALLOWED_METRICS = ["steps", "water", "sleep"] as const;

const fetchUserGoals = async (userId: string, date: Date) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  // First, get the user's target goals
  const { data: targetGoals, error: targetError } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .in('goal_type', ALLOWED_METRICS)
    .order('created_at', { ascending: false });

  if (targetError) throw targetError;

  // Then, get the progress for the specific date
  const { data: dateProgress, error: progressError } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('progress_date', formattedDate)
    .in('goal_type', ALLOWED_METRICS);

  if (progressError) throw progressError;

  // If no progress exists for this date, create new entries with current_value = 0
  if (dateProgress.length === 0 && targetGoals.length > 0) {
    const newProgressEntries = targetGoals.map(goal => ({
      user_id: userId,
      goal_type: goal.goal_type,
      target_value: goal.target_value,
      current_value: 0,
      unit: goal.unit,
      progress_date: formattedDate
    }));

    const { data: insertedProgress, error: insertError } = await supabase
      .from('user_goals')
      .insert(newProgressEntries)
      .select();

    if (insertError) throw insertError;
    return insertedProgress;
  }

  return dateProgress;
};

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.id) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);

  const dateRanges = [
    { label: 'Today', date: new Date() },
    { label: 'Yesterday', date: subDays(new Date(), 1) },
    { label: '2 Days Ago', date: subDays(new Date(), 2) },
  ];

  const { data: goals = [], refetch: refetchGoals, isLoading } = useQuery({
    queryKey: ['goals', userId, selectedDate],
    queryFn: () => userId ? fetchUserGoals(userId, selectedDate) : Promise.resolve([]),
    enabled: !!userId,
  });

  const handleGoalsUpdate = () => {
    refetchGoals();
    setDialogOpen(false);
  };

  const getCurrentGoals = () => {
    return {
      steps: goals.find(goal => goal.goal_type === 'steps')?.target_value || 10000,
      water: goals.find(goal => goal.goal_type === 'water')?.target_value || 2.5,
      sleep: goals.find(goal => goal.goal_type === 'sleep')?.target_value || 8
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Update Goals
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            {userId && (
              <GoalSettingForm
                userId={userId}
                initialGoals={getCurrentGoals()}
                onUpdate={handleGoalsUpdate}
                isUpdate
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <HealthDataIntegrations />
      
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard title="Recent Goals" className="h-full">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {dateRanges.map((range) => (
                <TabsTrigger
                  key={range.label}
                  value={range.label.toLowerCase()}
                  onClick={() => setSelectedDate(range.date)}
                >
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {dateRanges.map((range) => (
              <TabsContent key={range.label} value={range.label.toLowerCase()}>
                <div className="space-y-4">
                  {isLoading ? (
                    <p className="text-sm text-gray-500 text-center py-4">Loading goals...</p>
                  ) : goals.length > 0 ? (
                    goals
                      .filter(goal => ALLOWED_METRICS.includes(goal.goal_type))
                      .map((goal) => (
                        <HealthGoal
                          key={goal.id}
                          title={`Daily ${goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}`}
                          description={`${(goal.current_value || 0).toLocaleString()} / ${goal.target_value.toLocaleString()} ${goal.unit}`}
                          completed={(goal.current_value || 0) >= goal.target_value}
                        />
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No goals set yet</p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DashboardCard>

        <DashboardCard title="Quick Stats" className="h-full">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {dateRanges.map((range) => (
                <TabsTrigger
                  key={range.label}
                  value={range.label.toLowerCase()}
                  onClick={() => setSelectedDate(range.date)}
                >
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {dateRanges.map((range) => (
              <TabsContent key={range.label} value={range.label.toLowerCase()}>
                <div className="space-y-6">
                  {isLoading ? (
                    <p className="text-sm text-gray-500 text-center py-4">Loading stats...</p>
                  ) : goals.length > 0 ? (
                    goals
                      .filter(goal => ALLOWED_METRICS.includes(goal.goal_type))
                      .map((goal) => (
                        <HealthMetric
                          key={goal.id}
                          label={`${goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)} Today`}
                          value={goal.current_value || 0}
                          target={goal.target_value}
                          unit={goal.unit}
                          goalId={goal.id}
                          onUpdate={() => refetchGoals()}
                        />
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No goals set yet</p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Index;
