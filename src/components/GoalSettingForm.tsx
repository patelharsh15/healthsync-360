import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useGoals } from "@/hooks/useGoals";
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
  const navigate = useNavigate();
  const { isSubmitting, updateGoals } = useGoals(userId, () => {
    if (onUpdate) {
      onUpdate();
    } else {
      navigate('/');
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

    await updateGoals(goals, isUpdate);
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