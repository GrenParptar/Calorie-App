const OUNCE_IN_GRAMS = 28.3495;

export type PortionUnit = 'g' | 'oz' | 'serving';

export interface NutritionBasis {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  sugarPer100g: number;
}

export interface ScaledNutrition {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
}

/** Converts an amount entered in a given unit into grams, the common basis for scaling. */
export function amountToGrams(amount: number, unit: PortionUnit, servingSizeG?: number): number {
  if (unit === 'g') return amount;
  if (unit === 'oz') return amount * OUNCE_IN_GRAMS;
  return amount * (servingSizeG ?? 100);
}

/** Converts a gram amount into the equivalent amount in a target unit — used when the user
 *  switches units, so the underlying quantity of food stays the same across the conversion. */
export function gramsToAmount(grams: number, unit: PortionUnit, servingSizeG?: number): number {
  if (unit === 'g') return Math.round(grams);
  if (unit === 'oz') return Math.round((grams / OUNCE_IN_GRAMS) * 10) / 10;
  return Math.round((grams / (servingSizeG ?? 100)) * 10) / 10;
}

export function nutritionForGrams(basis: NutritionBasis, grams: number): ScaledNutrition {
  const factor = grams / 100;
  return {
    calories: Math.round(basis.caloriesPer100g * factor),
    proteinG: Math.round(basis.proteinPer100g * factor),
    carbsG: Math.round(basis.carbsPer100g * factor),
    fatG: Math.round(basis.fatPer100g * factor),
    sugarG: Math.round(basis.sugarPer100g * factor),
  };
}

export function unitLabel(unit: PortionUnit, servingLabel?: string): string {
  if (unit === 'g') return 'g';
  if (unit === 'oz') return 'oz';
  return servingLabel ?? 'serving';
}
