// The app always stores height/weight/water internally in metric (cm, kg, ml).
// These helpers only convert for display and for parsing user input in imperial mode.

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return inches === 12 ? { feet: feet + 1, inches: 0 } : { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10;
}

export function mlToFlOz(ml: number): number {
  return Math.round((ml / 29.5735) * 10) / 10;
}

export function flOzToMl(flOz: number): number {
  return Math.round(flOz * 29.5735);
}

export function formatHeight(heightCm: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'metric') return `${Math.round(heightCm)} cm`;
  const { feet, inches } = cmToFeetInches(heightCm);
  return `${feet}'${inches}"`;
}

export function formatWeight(weightKg: number, unitSystem: 'metric' | 'imperial'): string {
  return unitSystem === 'metric' ? `${weightKg.toFixed(1)} kg` : `${kgToLb(weightKg).toFixed(1)} lb`;
}

export function formatVolume(ml: number, unitSystem: 'metric' | 'imperial'): string {
  return unitSystem === 'metric' ? `${(ml / 1000).toFixed(2)} L` : `${mlToFlOz(ml).toFixed(1)} fl oz`;
}
