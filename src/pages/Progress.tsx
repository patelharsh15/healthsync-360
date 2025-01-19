import { DashboardCard } from "@/components/DashboardCard";
import { HealthMetric } from "@/components/HealthMetric";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Progress = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeProgress = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a health analytics AI. Analyze the user\'s progress metrics and provide encouraging, actionable feedback.'
            },
            {
              role: 'user',
              content: 'Analyze my current progress: Steps: 6500/10000, Water: 1.5/2.5L, Sleep: 6.5/8 hours'
            }
          ]
        }
      });

      if (error) throw error;

      toast({
        title: "Progress Analysis",
        description: data.choices[0].message.content,
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
          <button
            onClick={analyzeProgress}
            disabled={isAnalyzing}
            className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Progress"}
          </button>
        </div>
      </DashboardCard>
    </div>
  );
}

export default Progress;