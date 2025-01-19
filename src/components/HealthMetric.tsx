import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthMetricProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  goalId?: string;
  onUpdate?: () => void;
}

export function HealthMetric({ label, value, target, unit, goalId, onUpdate }: HealthMetricProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const progress = (value / target) * 100;

  const handleAddProgress = async () => {
    if (!goalId || !inputValue) return;
    
    setIsUpdating(true);
    const newValue = value + Number(inputValue);
    
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

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>
          {value} / {target} {unit}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      {!showInput ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => setShowInput(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Progress
        </Button>
      ) : (
        <div className="flex gap-2 mt-2">
          <Input
            type="number"
            placeholder={`Add ${unit}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleAddProgress}
            disabled={isUpdating || !inputValue}
          >
            Add
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setShowInput(false);
              setInputValue("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}