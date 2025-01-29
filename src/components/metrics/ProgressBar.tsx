import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  target: number;
  label: string;
  unit: string;
}

export function ProgressBar({ value, target, label, unit }: ProgressBarProps) {
  const progress = Math.min((value / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>
          {value.toLocaleString()} / {target.toLocaleString()} {unit}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}