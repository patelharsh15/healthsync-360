import { DashboardCard } from "@/components/DashboardCard";
import { HealthMetric } from "@/components/HealthMetric";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Goal } from "@/types/goals";
import { format } from "date-fns";

const Progress = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.id) return;

      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data: userGoals, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('progress_date', today);

      if (error) throw error;
      setGoals(userGoals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeProgress = async () => {
    setIsAnalyzing(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const metrics = goals.reduce((acc, goal) => ({
        ...acc,
        [goal.goal_type]: {
          value: goal.current_value || 0,
          target: goal.target_value,
          unit: goal.unit
        }
      }), {});

      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a health analytics AI. Analyze the user\'s progress metrics for today and provide encouraging, actionable feedback in a concise way. Focus on specific achievements and areas for improvement.'
            },
            {
              role: 'user',
              content: `Analyze my progress metrics for ${today}:
                ${Object.entries(metrics).map(([type, data]) => 
                  `${type}: ${(data as any).value}/${(data as any).target} ${(data as any).unit}`
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
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard title="Today's Progress" className="animate-fadeIn">
          <div className="space-y-6">
            {goals.map((goal) => (
              <HealthMetric
                key={goal.id}
                label={goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}
                value={goal.current_value || 0}
                target={goal.target_value}
                unit={goal.unit}
                goalId={goal.id}
                onUpdate={fetchGoals}
              />
            ))}
            {goals.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No goals set for today</p>
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

        {aiInsights && (
          <DashboardCard title="AI Insights" className="animate-fadeIn">
            <div className="prose prose-sm">
              <p className="text-gray-700 whitespace-pre-line">{aiInsights}</p>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}

export default Progress;