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

/** Query variants to try, broadest-relevance-first: the exact text, then a version with
 *  punctuation stripped (apostrophes/possessives trip up OFF's legacy text search — "lay's"
 *  vs "lays" can be the difference between zero hits and a full shelf of matches). */
function queryVariants(query: string): string[] {
  const trimmed = query.trim();
  const stripped = trimmed.replace(/['’]/g, '');
  const variants = [trimmed];
  if (stripped !== trimmed) variants.push(stripped);
  return variants;
}

async function fetchProducts(query: string, pageSize: number): Promise<OffProduct[]> {
  // Sort by popularity (scan count) so the well-known version of a branded product
  // (e.g. the actual Lay's Classic bag) outranks obscure regional variants.
  const url =
    `${SEARCH_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1` +
    `&page_size=${pageSize}&sort_by=unique_scans_n`;

  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data.products ?? [];
}

function dedupe(results: AiFoodResult[]): AiFoodResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.name.toLowerCase()}|${r.brand?.toLowerCase() ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Returns several matching branded products so the UI can show a picker instead of
 *  silently guessing at the single "best" one. */
export async function searchOpenFoodFactsCandidates(query: string, limit = 8): Promise<AiFoodResult[]> {
  const results: AiFoodResult[] = [];

  for (const variant of queryVariants(query)) {
    try {
      const products = await fetchProducts(variant, limit * 2);
      for (const product of products) {
        const result = productToResult(product);
        if (result) results.push(result);
      }
    } catch {
      // try the next variant
    }
    if (results.length >= limit) break;
  }

  return dedupe(results).slice(0, limit);
}

export async function searchOpenFoodFacts(query: string): Promise<AiFoodResult | null> {
  const [first] = await searchOpenFoodFactsCandidates(query, 1);
  return first ?? null;
}
