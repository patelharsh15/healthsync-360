import { MealAnalysis } from "@/components/MealAnalysis";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardCard } from "@/components/DashboardCard";

const Meals = () => {
  const [nutritionalInsights, setNutritionalInsights] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeMeal = async (imageBase64: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a nutritionist AI. Analyze the meal image and provide detailed nutritional insights, estimated calories, and healthy recommendations.'
            },
            {
              role: 'user',
              content: 'Analyze this meal image for nutritional content and provide specific recommendations for a balanced diet.'
            }
          ],
          image: imageBase64
        }
      });

      if (error) throw error;

      setNutritionalInsights(data.choices[0].message.content);
      toast({
        title: "Analysis Complete",
        description: "Nutritional insights have been generated for your meal.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Meal Analysis</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <MealAnalysis onImageSelect={analyzeMeal} />
        
        {nutritionalInsights && (
          <DashboardCard title="Nutritional Insights" className="animate-fadeIn">
            <div className="prose prose-sm">
              <p className="text-gray-700 whitespace-pre-line">{nutritionalInsights}</p>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}

export default Meals;