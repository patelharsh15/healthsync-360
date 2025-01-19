import { MealAnalysis } from "@/components/MealAnalysis";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardCard } from "@/components/DashboardCard";
import { Loader2 } from "lucide-react";

const Meals = () => {
  const [nutritionalInsights, setNutritionalInsights] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeMeal = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

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

      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from AI');
      }

      const analysis = data.choices[0].message.content;
      setNutritionalInsights(analysis);

      // Update the analysis in the database
      const { error: updateError } = await supabase
        .from('meal_analysis')
        .update({ analysis })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (updateError) throw updateError;

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
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Meal Analysis</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <MealAnalysis onImageSelect={analyzeMeal} />
        
        {isAnalyzing ? (
          <DashboardCard title="Analyzing..." className="animate-fadeIn">
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </DashboardCard>
        ) : nutritionalInsights && (
          <DashboardCard title="Nutritional Insights" className="animate-fadeIn">
            <div className="prose prose-sm">
              <p className="text-gray-700 whitespace-pre-line">{nutritionalInsights}</p>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
};

export default Meals;