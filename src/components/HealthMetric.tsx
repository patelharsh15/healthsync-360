import { ProgressBar } from "./metrics/ProgressBar";
import { AddProgressForm } from "./metrics/AddProgressForm";
import { useProgress } from "@/hooks/useProgress";

interface HealthMetricProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  goalId?: string;
  onUpdate?: () => void;
}

export function HealthMetric({ label, value, target, unit, goalId, onUpdate }: HealthMetricProps) {
  const {
    showInput,
    setShowInput,
    inputValue,
    setInputValue,
    isUpdating,
    updateProgress
  } = useProgress();

  const handleAddProgress = () => {
    updateProgress(goalId!, value, label, unit, onUpdate);
  };

  return (
    <div className="space-y-2">
      <ProgressBar
        value={value}
        target={target}
        label={label}
        unit={unit}
      />
      <AddProgressForm
        showInput={showInput}
        inputValue={inputValue}
        unit={unit}
        isUpdating={isUpdating}
        onInputChange={setInputValue}
        onAdd={handleAddProgress}
        onCancel={() => {
          setShowInput(false);
          setInputValue("");
        }}
        onShowInput={() => setShowInput(true)}
      />
    </div>
  );
}