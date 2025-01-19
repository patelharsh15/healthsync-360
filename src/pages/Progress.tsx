import { DashboardCard } from "@/components/DashboardCard";
import { HealthMetric } from "@/components/HealthMetric";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Progress = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeProgress = async () => {
    setIsAnalyzing(true);
    try {
      const metrics = {
        steps: { value: 6500, target: 10000 },
        water: { value: 1.5, target: 2.5 },
        sleep: { value: 6.5, target: 8 }
      };

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
                Steps: ${metrics.steps.value}/${metrics.steps.target}
                Water Intake: ${metrics.water.value}/${metrics.water.target}L
                Sleep: ${metrics.sleep.value}/${metrics.sleep.target} hours`
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
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard title="Today's Progress" className="animate-fadeIn">
          <div className="space-y-6">
            <HealthMetric
              label="Steps"
              value={6500}
              target={10000}
              unit="steps"
            />
            <HealthMetric
              label="Water"
              value={1.5}
              target={2.5}
              unit="L"
            />
            <HealthMetric
              label="Sleep"
              value={6.5}
              target={8}
              unit="hours"
            />
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