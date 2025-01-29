import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";
import { GoalSettingForm } from "../GoalSettingForm";

interface DashboardHeaderProps {
  userId: string | null;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  getCurrentGoals: () => {
    steps: number;
    water: number;
    sleep: number;
  };
  onGoalsUpdate: () => void;
}

export function DashboardHeader({
  userId,
  dialogOpen,
  setDialogOpen,
  getCurrentGoals,
  onGoalsUpdate,
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Update Goals
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          {userId && (
            <GoalSettingForm
              userId={userId}
              initialGoals={getCurrentGoals()}
              onUpdate={onGoalsUpdate}
              isUpdate
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}