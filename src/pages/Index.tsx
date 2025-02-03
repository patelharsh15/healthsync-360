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

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const { toast } = useToast();

  // Get the current user's session
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.id) {
        setUserId(session.user.id);
        // Call the function to ensure default goals exist
        const { error } = await supabase.rpc('insert_default_goals', {
          p_user_id: session.user.id
        });
        if (error) {
          console.error('Error creating default goals:', error);
          toast({
            title: "Error",
            description: "Failed to set up default goals. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    getUserId();
  }, [toast]);

  // Fetch goals with the updated query
  const { data: goals = [], refetch: refetchGoals, isLoading } = useQuery({
    queryKey: ['goals', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('progress_date', new Date().toISOString().split('T')[0]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch goals. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      return data as Goal[];
    },
    enabled: !!userId,
  });

  const getCurrentGoals = () => {
    return {
      steps: goals.find(goal => goal.goal_type === 'steps')?.target_value || 10000,
      water: goals.find(goal => goal.goal_type === 'water')?.target_value || 2.5,
      sleep: goals.find(goal => goal.goal_type === 'sleep')?.target_value || 8,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        userId={userId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        getCurrentGoals={getCurrentGoals}
        onGoalsUpdate={refetchGoals}
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
                <p className="text-sm text-gray-500 text-center py-4">Loading goals...</p>
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