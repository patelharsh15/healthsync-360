import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddProgressFormProps {
  showInput: boolean;
  inputValue: string;
  unit: string;
  isUpdating: boolean;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  onShowInput: () => void;
}

export function AddProgressForm({
  showInput,
  inputValue,
  unit,
  isUpdating,
  onInputChange,
  onAdd,
  onCancel,
  onShowInput,
}: AddProgressFormProps) {
  if (!showInput) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2"
        onClick={onShowInput}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Progress
      </Button>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <Input
        type="number"
        placeholder={`Add ${unit}`}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        className="flex-1"
      />
      <Button 
        onClick={onAdd}
        disabled={isUpdating || !inputValue}
      >
        Add
      </Button>
      <Button 
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
}