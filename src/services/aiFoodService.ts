import { FoodEntry } from '@/types';
import { NutritionBasis } from '@/utils/foodPortions';

export interface AiFoodResult {
  name: string;
  brand?: string;
  /** Nutrition per 100g — the common basis every unit (g / oz / serving) converts through. */
  basis: NutritionBasis;
  /** Grams in one "serving", if the source knows one (e.g. "1 bar (40g)", "1 medium banana (118g)"). */
  servingSizeG?: number;
  /** Human label for the serving unit, e.g. "1 bar", "1 medium banana". */
  servingLabel?: string;
  confidence: 'high' | 'medium' | 'low';
  source: FoodEntry['source'];
}

// A tiny offline dataset so the app is usable and demoable without network access
// at all (no Open Food Facts, no AI backend). This is only the last-resort safety net.
// Values are per-100g (USDA-reference-based) plus a typical serving size in grams.
const LOCAL_FALLBACK_FOODS: Record<string, Omit<AiFoodResult, 'source'>> = {
  banana: {
    name: 'Banana',
    basis: { caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, sugarPer100g: 12.2 },
    servingSizeG: 118,
    servingLabel: '1 medium banana',
    confidence: 'high',
  },
  'chicken breast': {
    name: 'Chicken breast, grilled',
    basis: { caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, sugarPer100g: 0 },
    servingSizeG: 85,
    servingLabel: '3 oz cooked',
    confidence: 'high',
  },
  'greek yogurt': {
    name: 'Greek yogurt, plain',
    basis: { caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, sugarPer100g: 3.6 },
    servingSizeG: 170,
    servingLabel: '1 cup',
    confidence: 'high',
  },
  avocado: {
    name: 'Avocado',
    basis: { caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7, sugarPer100g: 0.7 },
    servingSizeG: 150,
    servingLabel: '1 medium avocado',
    confidence: 'high',
  },
  oatmeal: {
    name: 'Oatmeal, cooked with water',
    basis: { caloriesPer100g: 68, proteinPer100g: 2.5, carbsPer100g: 12, fatPer100g: 1.4, sugarPer100g: 0.4 },
    servingSizeG: 234,
    servingLabel: '1 cup cooked',
    confidence: 'medium',
  },
  almonds: {
    name: 'Almonds',
    basis: { caloriesPer100g: 586, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, sugarPer100g: 4.4 },
    servingSizeG: 28,
    servingLabel: '1 oz (~23 almonds)',
    confidence: 'high',
  },
  egg: {
    name: 'Egg, large',
    basis: { caloriesPer100g: 144, proteinPer100g: 12.6, carbsPer100g: 0.8, fatPer100g: 9.6, sugarPer100g: 0.4 },
    servingSizeG: 50,
    servingLabel: '1 large egg',
    confidence: 'high',
  },
  rice: {
    name: 'White rice, cooked',
    basis: { caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28.2, fatPer100g: 0.3, sugarPer100g: 0.1 },
    servingSizeG: 158,
    servingLabel: '1 cup cooked',
    confidence: 'medium',
  },
};

const SYSTEM_PROMPT = `You are a nutrition data extraction assistant embedded in a calorie-tracking app.
Given a free-text food description, which may name a specific brand or restaurant item
("Quest protein bar", "Chick-fil-A chicken sandwich"), find its real nutrition facts.

You have web search available — use it. For name-brand or restaurant items, search the
manufacturer's site, the retailer/seller listing, or a nutrition label photo/description
rather than relying on memory, since exact label values matter here and guessing produces
wrong numbers. For generic whole foods (an apple, grilled chicken breast) standard reference
values (e.g. USDA FoodData Central) are fine without searching.

Respond ONLY with strict JSON matching this shape, no prose, no markdown fences:
{
  "name": string,
  "brand": string | null,
  "caloriesPer100g": number,
  "proteinPer100g": number,
  "carbsPer100g": number,
  "fatPer100g": number,
  "sugarPer100g": number,
  "servingSizeG": number | null,
  "servingLabel": string | null,
  "confidence": "high" | "medium" | "low"
}

Always report nutrition as an amount PER 100 GRAMS — never scaled to a specific quantity the
user typed, since the app handles unit conversion and serving-size math itself. If the food has
a natural serving (a bar, a can, a medium fruit, a slice), set "servingSizeG" to that serving's
weight in grams and "servingLabel" to a short human description (e.g. "1 bar", "1 medium apple").
If there's no natural discrete serving (rice, chicken breast), set both to null.
Set "confidence" to "low" only if you couldn't find or verify real data and are estimating.`;

interface AiClientConfig {
  /** Base URL of a backend proxy that forwards to an LLM with web search enabled.
   *  The API key must live server-side — never bundle it into the mobile app. */
  proxyUrl?: string;
}

let config: AiClientConfig = {
  proxyUrl: process.env.EXPO_PUBLIC_AI_PROXY_URL,
};

export function configureAiFoodService(next: AiClientConfig) {
  config = { ...config, ...next };
}

function parseModelJson(text: string): AiFoodResult | null {
  try {
    const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.caloriesPer100g !== 'number' || typeof parsed.name !== 'string') return null;
    return {
      name: parsed.name,
      brand: parsed.brand ?? undefined,
      basis: {
        caloriesPer100g: Math.round(parsed.caloriesPer100g),
        proteinPer100g: Math.round((parsed.proteinPer100g ?? 0) * 10) / 10,
        carbsPer100g: Math.round((parsed.carbsPer100g ?? 0) * 10) / 10,
        fatPer100g: Math.round((parsed.fatPer100g ?? 0) * 10) / 10,
        sugarPer100g: Math.round((parsed.sugarPer100g ?? 0) * 10) / 10,
      },
      servingSizeG: typeof parsed.servingSizeG === 'number' ? parsed.servingSizeG : undefined,
      servingLabel: parsed.servingLabel ?? undefined,
      confidence: parsed.confidence ?? 'medium',
      source: 'ai',
    };
  } catch {
    return null;
  }
}

export async function queryAiBackend(query: string): Promise<AiFoodResult | null> {
  if (!config.proxyUrl) return null;

  const response = await fetch(`${config.proxyUrl}/food-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, system: SYSTEM_PROMPT }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const text: string = data.text ?? data.completion ?? '';
  return parseModelJson(text);
}

export function queryLocalFallback(query: string): AiFoodResult | null {
  const key = Object.keys(LOCAL_FALLBACK_FOODS).find((k) => query.toLowerCase().includes(k));
  return key ? { ...LOCAL_FALLBACK_FOODS[key], source: 'manual' } : null;
}

export function queryLocalFallbackCandidates(query: string): AiFoodResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return Object.keys(LOCAL_FALLBACK_FOODS)
    .filter((k) => k.includes(trimmed) || trimmed.includes(k))
    .map((k) => ({ ...LOCAL_FALLBACK_FOODS[k], source: 'manual' as const }));
}

export function aiResultToFoodEntry(
  result: AiFoodResult,
  mealType: FoodEntry['mealType'],
  quantity: number,
  unit: string,
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  sugarG: number
): FoodEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: result.name,
    brand: result.brand,
    quantity,
    unit,
    calories,
    proteinG,
    carbsG,
    fatG,
    sugarG,
    loggedAt: new Date().toISOString(),
    mealType,
    source: result.source,
  };
}
