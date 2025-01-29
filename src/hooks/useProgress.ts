import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useProgress() {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateProgress = async (
    goalId: string,
    currentValue: number,
    label: string,
    unit: string,
    onUpdate?: () => void
  ) => {
    if (!goalId || !inputValue) return;
    
    setIsUpdating(true);
    const newValue = currentValue + Number(inputValue);
    
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Progress updated",
        description: `Added ${inputValue} ${unit} to your ${label.toLowerCase()} goal!`,
      });

      if (onUpdate) {
        onUpdate();
      }
      
      setShowInput(false);
      setInputValue("");
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    showInput,
    setShowInput,
    inputValue,
    setInputValue,
    isUpdating,
    updateProgress
  };
}