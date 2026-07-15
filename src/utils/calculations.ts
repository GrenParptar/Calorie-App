import { ActivityLevel, Gender, MacroTargets, PlanSummary, UserProfile } from '@/types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little to no exercise)',
  light: 'Lightly active (1-3 days/week)',
  moderate: 'Moderately active (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  very_active: 'Very active (athlete / physical job)',
};

const KCAL_PER_KG_FAT = 7700;
const MIN_CALORIES = { female: 1200, male: 1500, other: 1350 };
const MAX_SAFE_WEEKLY_LOSS_PERCENT = 0.01; // 1% of bodyweight/week is a widely used safe upper bound

// Mifflin-St Jeor equation.
export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  return base - 78; // average offset for non-binary/other
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateMacros(calories: number, weightKg: number, goal: UserProfile['goalDirection']): MacroTargets {
  // Protein prioritized for lean mass retention, especially during a deficit.
  const proteinPerKg = goal === 'lose' ? 2.0 : goal === 'gain' ? 1.8 : 1.6;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const proteinCals = proteinG * 4;

  const fatPercent = 0.28;
  const fatCals = calories * fatPercent;
  const fatG = Math.round(fatCals / 9);

  const remainingCals = Math.max(calories - proteinCals - fatCals, 0);
  const carbsG = Math.round(remainingCals / 4);

  // WHO guidance: keep free sugars under ~10% of total energy intake.
  const sugarLimitG = Math.round((calories * 0.1) / 4);

  return { calories: Math.round(calories), proteinG, carbsG, fatG, sugarLimitG };
}

export function buildPlan(profile: UserProfile): PlanSummary {
  const bmr = calculateBMR(profile.gender, profile.weightKg, profile.heightCm, profile.age);
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  const weightDeltaKg = profile.goalWeightKg - profile.weightKg;
  const weeks = Math.max(profile.goalTimeframeWeeks, 1);
  const weeklyWeightChangeKg = weightDeltaKg / weeks;

  const dailyCalorieDelta = (weeklyWeightChangeKg * KCAL_PER_KG_FAT) / 7;
  let targetCalories = tdee + dailyCalorieDelta;

  const floor = MIN_CALORIES[profile.gender] ?? MIN_CALORIES.other;
  targetCalories = Math.max(targetCalories, floor);

  const maxSafeWeeklyLossKg = profile.weightKg * MAX_SAFE_WEEKLY_LOSS_PERCENT;
  const isTimeframeSafe =
    profile.goalDirection !== 'lose' || Math.abs(weeklyWeightChangeKg) <= maxSafeWeeklyLossKg + 0.05;

  const macros = calculateMacros(targetCalories, profile.weightKg, profile.goalDirection);

  // Suggest exercise to help close part of the gap without over-restricting food.
  const suggestedExerciseSessionsPerWeek =
    profile.goalDirection === 'lose' ? 4 : profile.goalDirection === 'gain' ? 3 : 3;
  const suggestedExerciseMinutesPerWeek = suggestedExerciseSessionsPerWeek * 40;

  return {
    ...macros,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    weeklyWeightChangeKg: Number(weeklyWeightChangeKg.toFixed(2)),
    dailyCalorieDelta: Math.round(dailyCalorieDelta),
    isTimeframeSafe,
    suggestedExerciseMinutesPerWeek,
    suggestedExerciseSessionsPerWeek,
  };
}

export function safeMinWeeks(weightDeltaKg: number, weightKg: number): number {
  const maxWeeklyLossKg = weightKg * MAX_SAFE_WEEKLY_LOSS_PERCENT;
  if (maxWeeklyLossKg <= 0) return 1;
  return Math.ceil(Math.abs(weightDeltaKg) / maxWeeklyLossKg);
}
