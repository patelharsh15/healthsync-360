import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GoalSettingFormProps {
  userId: string;
  initialGoals?: {
    steps?: number;
    water?: number;
    sleep?: number;
  };
  onUpdate?: () => void;
  isUpdate?: boolean;
}

export function GoalSettingForm({ userId, initialGoals, onUpdate, isUpdate = false }: GoalSettingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const goals = [
      {
        goal_type: 'steps' as const,
        target_value: Number(formData.get('steps')),
        unit: 'steps'
      },
      {
        goal_type: 'water' as const,
        target_value: Number(formData.get('water')),
        unit: 'L'
      },
      {
        goal_type: 'sleep' as const,
        target_value: Number(formData.get('sleep')),
        unit: 'hours'
      }
    ];

    try {
      if (isUpdate) {
        // Update existing goals
        for (const goal of goals) {
          const { error } = await supabase
            .from('user_goals')
            .update({ target_value: goal.target_value })
            .eq('user_id', userId)
            .eq('goal_type', goal.goal_type);

          if (error) throw error;
        }
      } else {
        // Insert new goals
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

      if (onUpdate) {
        onUpdate();
      } else {
        navigate('/');
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isUpdate ? 'Update Your Health Goals' : 'Set Your Health Goals'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="steps">Daily Steps Target</Label>
          <Input
            id="steps"
            name="steps"
            type="number"
            defaultValue={initialGoals?.steps || "10000"}
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
            defaultValue={initialGoals?.water || "2.5"}
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
            defaultValue={initialGoals?.sleep || "8"}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? `${isUpdate ? 'Updating' : 'Setting'} goals...` : `${isUpdate ? 'Update' : 'Set'} Goals`}
        </Button>
      </form>
    </div>
  );
}