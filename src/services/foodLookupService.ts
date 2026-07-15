import { AiFoodResult, queryAiBackend, queryLocalFallback } from '@/services/aiFoodService';
import { searchOpenFoodFacts } from '@/services/openFoodFactsService';

/**
 * Resolves a free-text food description ("2 boiled eggs", "Cheerios", "grande oat milk latte")
 * into structured nutrition data, in three tiers:
 *  1. Open Food Facts — free branded-food database, best for packaged/name-brand items.
 *  2. AI backend with web search — for restaurant items or anything OFF doesn't carry.
 *  3. A small local dataset — offline/demo safety net if neither of the above is reachable.
 */
export async function searchFood(query: string): Promise<AiFoodResult> {
  const trimmed = query.trim();
  if (!trimmed) throw new Error('Enter a food to search for.');

  try {
    const offResult = await searchOpenFoodFacts(trimmed);
    if (offResult) return offResult;
  } catch {
    // fall through
  }

  try {
    const aiResult = await queryAiBackend(trimmed);
    if (aiResult) return aiResult;
  } catch {
    // fall through
  }

  const fallback = queryLocalFallback(trimmed);
  if (fallback) return fallback;

  throw new Error(
    `Couldn't find nutrition data for "${trimmed}". Try being more specific, or add it manually.`
  );
}
