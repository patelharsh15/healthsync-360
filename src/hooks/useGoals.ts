import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GoalData {
  goal_type: 'steps' | 'water' | 'sleep';
  target_value: number;
  unit: string;
}

export function useGoals(userId: string, onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateGoals = async (goals: GoalData[], isUpdate: boolean = false) => {
    setIsSubmitting(true);

    try {
      if (isUpdate) {
        for (const goal of goals) {
          const { error } = await supabase
            .from('user_goals')
            .update({ target_value: goal.target_value })
            .eq('user_id', userId)
            .eq('goal_type', goal.goal_type);

          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from('user_goals').insert(
          goals.map(goal => ({
            user_id: userId,
            ...goal
          }))
        );

        if (error) throw error;
      }

      toast({
        title: `Goals ${isUpdate ? 'updated' : 'set'} successfully!`,
        description: `Your health goals have been ${isUpdate ? 'updated' : 'saved'}.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error setting goals:', error);
      toast({
        title: "Error",
        description: `Failed to ${isUpdate ? 'update' : 'set'} goals. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    updateGoals
  };
}