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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardCard } from "@/components/DashboardCard";
import { HealthMetric } from "@/components/HealthMetric";

const ALLOWED_METRICS = ["steps", "water", "sleep", "weight", "exercise"] as const;

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const { toast } = useToast();

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
      sleep: goals.find(goal => goal.goal_type === 'sleep')?.target_value || 8,
      weight: goals.find(goal => goal.goal_type === 'weight')?.target_value || 70,
      exercise: goals.find(goal => goal.goal_type === 'exercise')?.target_value || 30,
    };
  };

  const analyzeProgress = async () => {
    setIsAnalyzing(true);
    try {
      const metrics = goals.reduce((acc, goal) => ({
        ...acc,
        [goal.goal_type]: { value: goal.current_value, target: goal.target_value }
      }), {});

      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a health analytics AI. Analyze the user\'s progress metrics and provide encouraging, actionable feedback in a concise way.'
            },
            {
              role: 'user',
              content: `Analyze my current progress metrics and provide specific recommendations:
                ${Object.entries(metrics).map(([type, data]) => 
                  `${type}: ${(data as any).value}/${(data as any).target}`
                ).join('\n')}`
            }
          ]
        }
      });

      if (error) throw error;

      setAiInsights(data.choices[0].message.content);
      toast({
        title: "Analysis Complete",
        description: "AI insights have been generated for your progress.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
          <DashboardCard title="Progress Analysis" className="h-full">
            <div className="space-y-6">
              {goals.map((goal) => (
                <HealthMetric
                  key={goal.id}
                  label={goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}
                  value={goal.current_value || 0}
                  target={goal.target_value}
                  unit={goal.unit}
                  goalId={goal.id}
                  onUpdate={refetchGoals}
                />
              ))}
              {goals.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No goals set yet</p>
              )}
              {goals.length > 0 && (
                <Button
                  onClick={analyzeProgress}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Progress"
                  )}
                </Button>
              )}
            </div>
          </DashboardCard>
        </Link>
        <QuickLinks />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GoalsOverview goals={goals} />
        <QuickStats goals={goals} onUpdate={refetchGoals} />
      </div>

      {aiInsights && (
        <DashboardCard title="AI Insights" className="animate-fadeIn">
          <div className="prose prose-sm">
            <p className="text-gray-700 whitespace-pre-line">{aiInsights}</p>
          </div>
        </DashboardCard>
      )}
    </div>
  );
};

export default Index;
