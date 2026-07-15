export type Gender = 'female' | 'male' | 'other';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type GoalDirection = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalDirection: GoalDirection;
  goalWeightKg: number;
  goalTimeframeWeeks: number;
}

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface PlanSummary extends MacroTargets {
  bmr: number;
  tdee: number;
  weeklyWeightChangeKg: number;
  dailyCalorieDelta: number;
  isTimeframeSafe: boolean;
  suggestedExerciseMinutesPerWeek: number;
  suggestedExerciseSessionsPerWeek: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  loggedAt: string; // ISO timestamp
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  source: 'ai' | 'manual' | 'recent';
}

export interface WaterEntry {
  id: string;
  amountMl: number;
  loggedAt: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  foods: FoodEntry[];
  water: WaterEntry[];
}
