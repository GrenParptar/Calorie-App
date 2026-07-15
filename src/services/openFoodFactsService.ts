import { AiFoodResult } from '@/services/aiFoodService';

// Open Food Facts is a free, open, crowd-sourced database of branded/packaged foods
// (hundreds of thousands of name-brand products with label nutrition facts) with no
// API key required. It's the right first stop for name-brand items — the AI search
// path is a fallback for whatever OFF doesn't have (e.g. restaurant/local dishes).
const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

interface OffNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  sugars_100g?: number;
}

interface OffProduct {
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: OffNutriments;
}

/** Parses a grams figure out of an Open Food Facts serving_size string, e.g. "1 bar (40 g)" -> 40. */
function parseServingGrams(servingSize?: string): number | undefined {
  if (!servingSize) return undefined;
  const match = servingSize.match(/([\d.]+)\s*g\b/i);
  return match ? Number(match[1]) : undefined;
}

function productToResult(product: OffProduct): AiFoodResult | null {
  const name = product.product_name?.trim();
  if (!name) return null;

  const n = product.nutriments ?? {};
  const caloriesPer100g = n['energy-kcal_100g'];
  if (typeof caloriesPer100g !== 'number') return null;

  return {
    name,
    brand: product.brands?.split(',')[0]?.trim(),
    basis: {
      caloriesPer100g: Math.round(caloriesPer100g),
      proteinPer100g: Math.round((n.proteins_100g ?? 0) * 10) / 10,
      carbsPer100g: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
      fatPer100g: Math.round((n.fat_100g ?? 0) * 10) / 10,
      sugarPer100g: Math.round((n.sugars_100g ?? 0) * 10) / 10,
    },
    servingSizeG: parseServingGrams(product.serving_size),
    servingLabel: product.serving_size,
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
