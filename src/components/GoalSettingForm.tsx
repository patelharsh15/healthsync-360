import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GoalSettingFormProps {
  userId: string;
}

export function GoalSettingForm({ userId }: GoalSettingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const goals = [
      {
        goal_type: 'steps',
        target_value: Number(formData.get('steps')),
        unit: 'steps'
      },
      {
        goal_type: 'water',
        target_value: Number(formData.get('water')),
        unit: 'L'
      },
      {
        goal_type: 'sleep',
        target_value: Number(formData.get('sleep')),
        unit: 'hours'
      }
    ];

    try {
      const { error } = await supabase.from('user_goals').insert(
        goals.map(goal => ({
          user_id: userId,
          ...goal
        }))
      );

      if (error) throw error;

      toast({
        title: "Goals set successfully!",
        description: "Your health goals have been saved.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error setting goals:', error);
      toast({
        title: "Error",
        description: "Failed to set goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Your Health Goals</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="steps">Daily Steps Target</Label>
          <Input
            id="steps"
            name="steps"
            type="number"
            defaultValue="10000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="water">Daily Water Intake (L)</Label>
          <Input
            id="water"
            name="water"
            type="number"
            step="0.1"
            defaultValue="2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sleep">Daily Sleep Target (hours)</Label>
          <Input
            id="sleep"
            name="sleep"
            type="number"
            step="0.5"
            defaultValue="8"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Setting goals..." : "Set Goals"}
        </Button>
      </form>
    </div>
  );
}