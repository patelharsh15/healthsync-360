import { Progress } from "@/components/ui/progress";

interface HealthMetricProps {
  label: string;
  value: number;
  target: number;
  unit: string;
}

export function HealthMetric({ label, value, target, unit }: HealthMetricProps) {
  const progress = (value / target) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>
          {value} / {target} {unit}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}