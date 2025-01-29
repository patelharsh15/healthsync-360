import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { HealthDataIntegrations } from "@/components/HealthDataIntegrations";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { GoalsOverview } from "@/components/dashboard/GoalsOverview";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { Goal } from "@/types/goals";

const ALLOWED_METRICS = ["steps", "water", "sleep"] as const;

const fetchUserGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .in('goal_type', ALLOWED_METRICS)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Goal[];
};

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.id) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);

  const { data: goals = [], refetch: refetchGoals } = useQuery({
    queryKey: ['goals', userId],
    queryFn: () => userId ? fetchUserGoals(userId) : Promise.resolve([]),
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
      <DashboardHeader
        userId={userId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        getCurrentGoals={getCurrentGoals}
        onGoalsUpdate={handleGoalsUpdate}
      />
      
      <HealthDataIntegrations />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/progress" className="transition-transform hover:scale-105">
          <QuickStats goals={goals} onUpdate={refetchGoals} />
        </Link>
        <QuickLinks />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GoalsOverview goals={goals} />
        <QuickStats goals={goals} onUpdate={refetchGoals} />
      </div>
    </div>
  );
};

export default Index;