export type Gender = 'female' | 'male' | 'other';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type GoalDirection = 'lose' | 'maintain' | 'gain';

export type UnitSystem = 'metric' | 'imperial';

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
  unitSystem: UnitSystem;
}

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarLimitG: number;
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

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
  sugarG: number;
  loggedAt: string; // ISO timestamp
  mealType: MealType;
  source: 'open-food-facts' | 'ai' | 'manual' | 'recent';
}

export interface WaterEntry {
  id: string;
  amountMl: number;
  loggedAt: string;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  met: number;
  durationMinutes: number;
  caloriesBurned: number;
  loggedAt: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  foods: FoodEntry[];
  water: WaterEntry[];
  exercises: ExerciseEntry[];
}
