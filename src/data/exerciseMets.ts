// MET (Metabolic Equivalent of Task) values sourced from the 2024 Adult Compendium
// of Physical Activities (Herrmann et al.), the standard public research reference
// used by fitness and health apps to estimate energy expenditure. It's a curated
// local dataset rather than a live API — MET values for a given activity don't
// change, so there's no benefit to a network round-trip for this.
//
// Calories burned = MET x weight(kg) x duration(hours).

export interface ExerciseMet {
  name: string;
  met: number;
  category: 'cardio' | 'strength' | 'sports' | 'flexibility' | 'daily';
}

export const EXERCISE_METS: ExerciseMet[] = [
  { name: 'Walking (3 mph, moderate pace)', met: 3.5, category: 'cardio' },
  { name: 'Walking (4 mph, brisk)', met: 5.0, category: 'cardio' },
  { name: 'Running (5 mph)', met: 8.3, category: 'cardio' },
  { name: 'Running (6 mph)', met: 9.8, category: 'cardio' },
  { name: 'Running (7.5 mph)', met: 11.8, category: 'cardio' },
  { name: 'Cycling, leisure (<10 mph)', met: 4.0, category: 'cardio' },
  { name: 'Cycling, moderate (12-14 mph)', met: 8.0, category: 'cardio' },
  { name: 'Cycling, vigorous (16-19 mph)', met: 12.0, category: 'cardio' },
  { name: 'Swimming, moderate laps', met: 7.0, category: 'cardio' },
  { name: 'Swimming, vigorous laps', met: 9.8, category: 'cardio' },
  { name: 'Elliptical trainer', met: 5.0, category: 'cardio' },
  { name: 'Rowing machine, moderate', met: 7.0, category: 'cardio' },
  { name: 'Stair climbing', met: 8.8, category: 'cardio' },
  { name: 'Jump rope', met: 10.0, category: 'cardio' },
  { name: 'Hiking, cross-country', met: 6.0, category: 'cardio' },
  { name: 'Spinning class', met: 8.5, category: 'cardio' },
  { name: 'Dancing, general', met: 5.0, category: 'cardio' },
  { name: 'HIIT / circuit training', met: 8.0, category: 'cardio' },
  { name: 'Weight lifting, general', met: 3.5, category: 'strength' },
  { name: 'Weight lifting, vigorous', met: 6.0, category: 'strength' },
  { name: 'CrossFit-style workout', met: 8.0, category: 'strength' },
  { name: 'Calisthenics (push-ups, sit-ups)', met: 3.8, category: 'strength' },
  { name: 'Yoga', met: 3.0, category: 'flexibility' },
  { name: 'Pilates', met: 3.0, category: 'flexibility' },
  { name: 'Stretching', met: 2.3, category: 'flexibility' },
  { name: 'Basketball', met: 6.5, category: 'sports' },
  { name: 'Soccer', met: 7.0, category: 'sports' },
  { name: 'Tennis', met: 7.3, category: 'sports' },
  { name: 'Boxing (sparring/training)', met: 9.5, category: 'sports' },
  { name: 'Golf (walking, carrying clubs)', met: 4.3, category: 'sports' },
  { name: 'Gardening', met: 3.8, category: 'daily' },
  { name: 'Cleaning the house', met: 3.3, category: 'daily' },
];

export function searchExerciseMets(query: string): ExerciseMet[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return EXERCISE_METS.filter((e) => e.name.toLowerCase().includes(trimmed));
}

export function calculateCaloriesBurned(met: number, weightKg: number, durationMinutes: number): number {
  return Math.round(met * weightKg * (durationMinutes / 60));
}
