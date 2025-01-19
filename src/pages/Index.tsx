import { DashboardCard } from "@/components/DashboardCard";
import { HealthMetric } from "@/components/HealthMetric";
import { HealthGoal } from "@/components/HealthGoal";
import { HealthDataIntegrations } from "@/components/HealthDataIntegrations";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, Utensils, Mic, MessageSquare, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GoalSettingForm } from "@/components/GoalSettingForm";
import { useQuery } from "@tanstack/react-query";

interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number | null;
  unit: string;
}

const fetchUserGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId);

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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/progress" className="transition-transform hover:scale-105">
          <DashboardCard title="Progress Overview" className="h-full">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                <Activity className="h-5 w-5" />
                <span className="font-medium">Track Your Progress</span>
              </div>
              <HealthMetric
                label="Daily Goals Progress"
                value={goals.filter(g => (g.current_value || 0) >= g.target_value).length}
                target={goals.length}
                unit="completed"
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>View Details</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </DashboardCard>
        </Link>

        <Link to="/meals" className="transition-transform hover:scale-105">
          <DashboardCard title="Meal Analysis" className="h-full">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                <Utensils className="h-5 w-5" />
                <span className="font-medium">Analyze Your Meals</span>
              </div>
              <p className="text-sm text-gray-500">Get AI-powered nutritional insights for your meals</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Start Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </DashboardCard>
        </Link>

        <Link to="/journal" className="transition-transform hover:scale-105">
          <DashboardCard title="Voice Journal" className="h-full">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                <Mic className="h-5 w-5" />
                <span className="font-medium">Record Your Journey</span>
              </div>
              <p className="text-sm text-gray-500">Log your health journey with voice notes</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Start Recording</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </DashboardCard>
        </Link>

        <Link to="/chat" className="transition-transform hover:scale-105 md:col-span-2 lg:col-span-3">
          <DashboardCard title="Health Assistant" className="h-full">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">AI Health Assistant</span>
              </div>
              <p className="text-sm text-gray-500">Get personalized health advice and support</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Start Chat</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </DashboardCard>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard title="Recent Goals" className="h-full">
          <div className="space-y-4">
            {goals.map((goal) => (
              <HealthGoal
                key={goal.id}
                title={`Daily ${goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}`}
                description={`${(goal.current_value || 0).toLocaleString()} / ${goal.target_value.toLocaleString()} ${goal.unit}`}
                completed={(goal.current_value || 0) >= goal.target_value}
              />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Stats" className="h-full">
          <div className="space-y-6">
            {goals.map((goal) => (
              <HealthMetric
                key={goal.id}
                label={`${goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)} Today`}
                value={goal.current_value || 0}
                target={goal.target_value}
                unit={goal.unit}
                goalId={goal.id}
                onUpdate={refetchGoals}
              />
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Index;