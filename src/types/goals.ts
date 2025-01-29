export interface Goal {
  id: string;
  goal_type: "steps" | "water" | "sleep";
  target_value: number;
  current_value: number | null;
  unit: string;
  created_at: string;
  progress_date?: string;
}