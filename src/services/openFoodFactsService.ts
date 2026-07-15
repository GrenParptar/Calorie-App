import { AiFoodResult } from '@/services/aiFoodService';

// Open Food Facts is a free, open, crowd-sourced database of branded/packaged foods
// (hundreds of thousands of name-brand products with label nutrition facts) with no
// API key required. It's the right first stop for name-brand items — the AI search
// path is a fallback for whatever OFF doesn't have (e.g. restaurant/local dishes).
const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

interface OffNutriments {
  'energy-kcal_100g'?: number;
  'energy-kcal_serving'?: number;
  proteins_100g?: number;
  proteins_serving?: number;
  carbohydrates_100g?: number;
  carbohydrates_serving?: number;
  fat_100g?: number;
  fat_serving?: number;
  sugars_100g?: number;
  sugars_serving?: number;
}

interface OffProduct {
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: OffNutriments;
}

function productToResult(product: OffProduct): AiFoodResult | null {
  const name = product.product_name?.trim();
  if (!name) return null;

  const n = product.nutriments ?? {};
  const hasServing = typeof n['energy-kcal_serving'] === 'number';

  const calories = hasServing ? n['energy-kcal_serving'] : n['energy-kcal_100g'];
  if (typeof calories !== 'number') return null;

  const proteinG = (hasServing ? n.proteins_serving : n.proteins_100g) ?? 0;
  const carbsG = (hasServing ? n.carbohydrates_serving : n.carbohydrates_100g) ?? 0;
  const fatG = (hasServing ? n.fat_serving : n.fat_100g) ?? 0;
  const sugarG = (hasServing ? n.sugars_serving : n.sugars_100g) ?? 0;

  return {
    name,
    brand: product.brands?.split(',')[0]?.trim(),
    quantity: 1,
    unit: hasServing ? (product.serving_size ?? 'serving') : '100 g',
    calories: Math.round(calories),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
    sugarG: Math.round(sugarG),
    confidence: 'high',
    source: 'open-food-facts',
  };
}

export async function searchOpenFoodFacts(query: string): Promise<AiFoodResult | null> {
  const url = `${SEARCH_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const products: OffProduct[] = data.products ?? [];

  for (const product of products) {
    const result = productToResult(product);
    if (result) return result;
  }
  return null;
}
