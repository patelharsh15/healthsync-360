import { MealAnalysis } from "@/components/MealAnalysis";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Meals = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeMeal = async (imageBase64: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a nutritionist AI. Analyze the meal image and provide nutritional insights and recommendations.'
            },
            {
              role: 'user',
              content: 'Analyze this meal image for nutritional content and provide recommendations.'
            }
          ]
        }
      });

      if (error) throw error;

      toast({
        title: "Meal Analysis",
        description: data.choices[0].message.content,
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
      <MealAnalysis onImageSelect={analyzeMeal} />
    </div>
  );
}

export default Meals;