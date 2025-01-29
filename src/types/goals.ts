export interface Goal {
  id: string;
  goal_type: "steps" | "water" | "sleep" | "weight" | "exercise";
  target_value: number;
  current_value: number | null;
  unit: string;
  created_at: string;
  progress_date?: string;
  user_id: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  value: number;
  date: string;
}

export interface GoalSettings {
  steps?: number;
  water?: number;
  sleep?: number;
  weight?: number;
  exercise?: number;
}