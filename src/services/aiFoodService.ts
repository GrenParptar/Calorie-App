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
  sugarG: number;
  confidence: 'high' | 'medium' | 'low';
  source: FoodEntry['source'];
}

// A tiny offline dataset so the app is usable and demoable without network access
// at all (no Open Food Facts, no AI backend). This is only the last-resort safety net.
const LOCAL_FALLBACK_FOODS: Record<string, Omit<AiFoodResult, 'source'>> = {
  banana: { name: 'Banana', quantity: 1, unit: 'medium (118g)', calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4, sugarG: 14, confidence: 'high' },
  'chicken breast': { name: 'Chicken breast, grilled', quantity: 100, unit: 'g', calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, sugarG: 0, confidence: 'high' },
  'greek yogurt': { name: 'Greek yogurt, plain', quantity: 170, unit: 'g (1 cup)', calories: 100, proteinG: 17, carbsG: 6, fatG: 0.7, sugarG: 6, confidence: 'high' },
  avocado: { name: 'Avocado', quantity: 1, unit: 'medium', calories: 234, proteinG: 2.9, carbsG: 12, fatG: 21, sugarG: 1, confidence: 'high' },
  oatmeal: { name: 'Oatmeal, cooked with water', quantity: 1, unit: 'cup', calories: 158, proteinG: 6, carbsG: 27, fatG: 3.2, sugarG: 1, confidence: 'medium' },
  almonds: { name: 'Almonds', quantity: 28, unit: 'g (~23 almonds)', calories: 164, proteinG: 6, carbsG: 6, fatG: 14, sugarG: 1, confidence: 'high' },
  egg: { name: 'Egg, large', quantity: 1, unit: 'egg', calories: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8, sugarG: 0.2, confidence: 'high' },
  rice: { name: 'White rice, cooked', quantity: 1, unit: 'cup', calories: 205, proteinG: 4.3, carbsG: 45, fatG: 0.4, sugarG: 0.1, confidence: 'medium' },
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
  "quantity": number,
  "unit": string,
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "sugarG": number,
  "confidence": "high" | "medium" | "low"
}

If the user gives a quantity ("2 eggs", "150g chicken"), scale the nutrition to that quantity
and set "quantity"/"unit" to reflect it. If no quantity is given, use the label's serving size
for branded items, or a typical single serving otherwise.
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
      sugarG: Math.round(parsed.sugarG ?? 0),
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

/** Scales a food result to a new quantity, assuming nutrition is linear in amount. */
export function scaleFoodResult(result: AiFoodResult, newQuantity: number): AiFoodResult {
  if (result.quantity <= 0) return result;
  const factor = newQuantity / result.quantity;
  return {
    ...result,
    quantity: newQuantity,
    calories: Math.round(result.calories * factor),
    proteinG: Math.round(result.proteinG * factor),
    carbsG: Math.round(result.carbsG * factor),
    fatG: Math.round(result.fatG * factor),
    sugarG: Math.round(result.sugarG * factor),
  };
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
    sugarG: result.sugarG,
    loggedAt: new Date().toISOString(),
    mealType,
    source: result.source,
  };
}
