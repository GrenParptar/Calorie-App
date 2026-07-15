import { FoodEntry } from '@/types';

export interface AiFoodResult {
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: 'high' | 'medium' | 'low';
}

// A tiny offline dataset so the app is usable and demoable without network access
// or an AI backend configured. The AI path (below) is what makes search open-ended —
// this is only the safety net.
const LOCAL_FALLBACK_FOODS: Record<string, AiFoodResult> = {
  banana: { name: 'Banana', quantity: 1, unit: 'medium (118g)', calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4, confidence: 'high' },
  'chicken breast': { name: 'Chicken breast, grilled', quantity: 100, unit: 'g', calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, confidence: 'high' },
  'greek yogurt': { name: 'Greek yogurt, plain', quantity: 170, unit: 'g (1 cup)', calories: 100, proteinG: 17, carbsG: 6, fatG: 0.7, confidence: 'high' },
  avocado: { name: 'Avocado', quantity: 1, unit: 'medium', calories: 234, proteinG: 2.9, carbsG: 12, fatG: 21, confidence: 'high' },
  oatmeal: { name: 'Oatmeal, cooked with water', quantity: 1, unit: 'cup', calories: 158, proteinG: 6, carbsG: 27, fatG: 3.2, confidence: 'medium' },
  almonds: { name: 'Almonds', quantity: 28, unit: 'g (~23 almonds)', calories: 164, proteinG: 6, carbsG: 6, fatG: 14, confidence: 'high' },
  egg: { name: 'Egg, large', quantity: 1, unit: 'egg', calories: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8, confidence: 'high' },
  rice: { name: 'White rice, cooked', quantity: 1, unit: 'cup', calories: 205, proteinG: 4.3, carbsG: 45, fatG: 0.4, confidence: 'medium' },
};

const SYSTEM_PROMPT = `You are a nutrition data extraction assistant embedded in a calorie-tracking app.
Given a free-text food description (which may include a brand, quantity, and preparation method),
return your best estimate of its nutrition facts.

Respond ONLY with strict JSON matching this shape, no prose, no markdown fences:
{
  "name": string,
  "brand": string | null,
  "quantity": number,
  "unit": string,
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "confidence": "high" | "medium" | "low"
}

Use standard reference values (e.g. USDA FoodData Central) when the food is generic.
If the user gives a quantity ("2 eggs", "150g chicken"), scale the nutrition to that quantity
and set "quantity"/"unit" to reflect it. If no quantity is given, use a typical single serving.
Set "confidence" to "low" if you are guessing at an unfamiliar branded or homemade item.`;

interface AiClientConfig {
  /** Base URL of a backend proxy that forwards to the Claude Messages API.
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
    if (typeof parsed.calories !== 'number' || typeof parsed.name !== 'string') return null;
    return {
      name: parsed.name,
      brand: parsed.brand ?? undefined,
      quantity: parsed.quantity ?? 1,
      unit: parsed.unit ?? 'serving',
      calories: Math.round(parsed.calories),
      proteinG: Math.round(parsed.proteinG ?? 0),
      carbsG: Math.round(parsed.carbsG ?? 0),
      fatG: Math.round(parsed.fatG ?? 0),
      confidence: parsed.confidence ?? 'medium',
    };
  } catch {
    return null;
  }
}

async function queryAiBackend(query: string): Promise<AiFoodResult | null> {
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

function queryLocalFallback(query: string): AiFoodResult | null {
  const key = Object.keys(LOCAL_FALLBACK_FOODS).find((k) => query.toLowerCase().includes(k));
  return key ? LOCAL_FALLBACK_FOODS[key] : null;
}

/**
 * Resolves a free-text food description ("2 boiled eggs", "grande oat milk latte")
 * into structured nutrition data. Tries the AI backend first (if configured),
 * then falls back to a small local dataset so search still works offline/in demos.
 */
export async function searchFoodWithAi(query: string): Promise<AiFoodResult> {
  const trimmed = query.trim();
  if (!trimmed) throw new Error('Enter a food to search for.');

  try {
    const aiResult = await queryAiBackend(trimmed);
    if (aiResult) return aiResult;
  } catch {
    // fall through to local fallback
  }

  const fallback = queryLocalFallback(trimmed);
  if (fallback) return fallback;

  throw new Error(
    `Couldn't find nutrition data for "${trimmed}". Try being more specific, or add it manually.`
  );
}

export function aiResultToFoodEntry(
  result: AiFoodResult,
  mealType: FoodEntry['mealType']
): FoodEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: result.name,
    brand: result.brand,
    quantity: result.quantity,
    unit: result.unit,
    calories: result.calories,
    proteinG: result.proteinG,
    carbsG: result.carbsG,
    fatG: result.fatG,
    loggedAt: new Date().toISOString(),
    mealType,
    source: 'ai',
  };
}
