import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArchHeader } from '@/components/ArchHeader';
import { BohoCard } from '@/components/BohoCard';
import { colors, radii, spacing, typography } from '@/theme/theme';
import { aiResultToFoodEntry, AiFoodResult } from '@/services/aiFoodService';
import { searchFood, searchFoodCandidates } from '@/services/foodLookupService';
import { useLog } from '@/context/LogContext';
import { FoodEntry } from '@/types';
import { amountToGrams, gramsToAmount, nutritionForGrams, PortionUnit, unitLabel } from '@/utils/foodPortions';

const MEALS: { value: FoodEntry['mealType']; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const SOURCE_LABELS: Record<AiFoodResult['source'], string> = {
  'open-food-facts': 'Open Food Facts',
  ai: 'AI web search',
  manual: 'local dataset',
  recent: 'recent',
};

const SUGGESTION_DEBOUNCE_MS = 350;

export function FoodSearchScreen() {
  const { addFood } = useLog();
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState<FoodEntry['mealType']>('breakfast');
  const [result, setResult] = useState<AiFoodResult | null>(null);
  const [unit, setUnit] = useState<PortionUnit>('serving');
  const [amountText, setAmountText] = useState('1');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);

  const [suggestions, setSuggestions] = useState<AiFoodResult[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (result || query.trim().length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    setIsSuggesting(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const found = await searchFoodCandidates(query);
        setSuggestions(found);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, result]);

  const availableUnits: PortionUnit[] = result?.servingSizeG ? ['serving', 'g', 'oz'] : ['g', 'oz'];

  const amount = Number(amountText);
  const isValidAmount = amountText.length > 0 && !Number.isNaN(amount) && amount > 0;
  const grams = result && isValidAmount ? amountToGrams(amount, unit, result.servingSizeG) : 0;
  const nutrition = result ? nutritionForGrams(result.basis, grams) : null;

  const applyResult = (found: AiFoodResult) => {
    setResult(found);
    setSuggestions([]);
    setError(null);
    setLogged(false);
    if (found.servingSizeG) {
      setUnit('serving');
      setAmountText('1');
    } else {
      setUnit('g');
      setAmountText('100');
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    setResult(null);
    setLogged(false);
    try {
      const found = await searchFood(query);
      applyResult(found);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearResult = () => {
    setResult(null);
    setError(null);
    setLogged(false);
  };

  const handleUnitChange = (nextUnit: PortionUnit) => {
    if (!result || nextUnit === unit) return;
    // Convert the entered amount to grams under the old unit, then express that same
    // quantity of food in the new unit — so switching units doesn't change how much food it is.
    const currentGrams = isValidAmount ? amountToGrams(amount, unit, result.servingSizeG) : 0;
    const nextAmount = gramsToAmount(currentGrams, nextUnit, result.servingSizeG);
    setUnit(nextUnit);
    setAmountText(String(nextAmount));
  };

  const handleLog = () => {
    if (!result || !nutrition || !isValidAmount) return;
    addFood(
      aiResultToFoodEntry(
        result,
        mealType,
        amount,
        unitLabel(unit, result.servingLabel),
        nutrition.calories,
        nutrition.proteinG,
        nutrition.carbsG,
        nutrition.fatG,
        nutrition.sugarG
      )
    );
    setLogged(true);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ArchHeader title="Search Food" subtitle="Name-brand or generic — we'll find the real numbers" />

      <BohoCard style={styles.section}>
        <TextInput
          style={styles.input}
          placeholder={'e.g. "Lay\'s potato chips" or "2 scrambled eggs"'}
          placeholderTextColor={colors.inkSoft}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setResult(null);
          }}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        {isSuggesting && (
          <View style={styles.suggestingRow}>
            <ActivityIndicator size="small" color={colors.terracotta} />
            <Text style={[typography.caption as any, styles.suggestingText]}>Searching…</Text>
          </View>
        )}

        {!result && suggestions.length > 0 && (
          <View style={styles.dropdown}>
            {suggestions.map((s, i) => (
              <Pressable
                key={`${s.name}-${i}`}
                style={[styles.suggestionRow, i === suggestions.length - 1 && styles.suggestionRowLast]}
                onPress={() => applyResult(s)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={typography.body as any}>{s.name}</Text>
                  {s.brand ? <Text style={typography.caption as any}>{s.brand}</Text> : null}
                </View>
                <Text style={typography.caption as any}>{s.basis.caloriesPer100g} kcal/100g</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable style={styles.searchButton} onPress={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <ActivityIndicator color={colors.cream} />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </Pressable>
      </BohoCard>

      {error && (
        <BohoCard style={[styles.section, styles.errorCard]}>
          <Text style={styles.errorText}>{error}</Text>
        </BohoCard>
      )}

      {result && nutrition && (
        <BohoCard style={styles.section}>
          <Pressable style={styles.closeButton} onPress={handleClearResult} hitSlop={10}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          <Text style={[typography.heading as any, styles.resultTitle]}>{result.name}</Text>
          {result.brand ? <Text style={typography.caption as any}>{result.brand}</Text> : null}
          <Text style={[typography.caption as any, styles.spacer]}>
            source: {SOURCE_LABELS[result.source]} · confidence: {result.confidence}
          </Text>

          <Text style={[typography.label as any, styles.spacer]}>UNIT</Text>
          <View style={styles.mealRow}>
            {availableUnits.map((u) => (
              <Pressable
                key={u}
                style={[styles.mealPill, unit === u && styles.mealPillSelected]}
                onPress={() => handleUnitChange(u)}
              >
                <Text style={[styles.mealPillText, unit === u && styles.mealPillTextSelected]}>
                  {unitLabel(u, result.servingLabel)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[typography.label as any, styles.spacer]}>AMOUNT</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amountText}
            onChangeText={setAmountText}
          />

          <View style={styles.macroGrid}>
            <MacroStat label="Calories" value={`${nutrition.calories}`} />
            <MacroStat label="Protein" value={`${nutrition.proteinG}g`} />
            <MacroStat label="Carbs" value={`${nutrition.carbsG}g`} />
            <MacroStat label="Fat" value={`${nutrition.fatG}g`} />
            <MacroStat label="Sugar" value={`${nutrition.sugarG}g`} />
          </View>

          <Text style={[typography.label as any, styles.spacer]}>LOG AS</Text>
          <View style={styles.mealRow}>
            {MEALS.map((m) => (
              <Pressable
                key={m.value}
                style={[styles.mealPill, mealType === m.value && styles.mealPillSelected]}
                onPress={() => setMealType(m.value)}
              >
                <Text style={[styles.mealPillText, mealType === m.value && styles.mealPillTextSelected]}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.logButton} onPress={handleLog} disabled={!isValidAmount}>
            <Text style={styles.logButtonText}>{logged ? 'Logged ✓' : 'Add to log'}</Text>
          </Pressable>
        </BohoCard>
      )}
    </ScrollView>
  );
}

function MacroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroStat}>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={typography.label as any}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  section: { marginBottom: spacing.md },
  spacer: { marginTop: spacing.sm },
  input: {
    backgroundColor: colors.cream,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.ink,
    fontSize: 15,
  },
  suggestingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  suggestingText: { marginLeft: spacing.xs },
  dropdown: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.cream,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  suggestionRowLast: { borderBottomWidth: 0 },
  searchButton: {
    backgroundColor: colors.terracottaDark,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  searchButtonText: { color: colors.cream, fontWeight: '700' },
  errorCard: { backgroundColor: '#F3E3CE', borderColor: colors.warning },
  errorText: { color: colors.rust },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  resultTitle: { paddingRight: spacing.xl },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  macroStat: { minWidth: '40%' },
  macroValue: { fontSize: 20, fontWeight: '700', color: colors.ink },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  mealPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
  },
  mealPillSelected: { backgroundColor: colors.sage, borderColor: colors.sage },
  mealPillText: { ...typography.caption, color: colors.ink },
  mealPillTextSelected: { color: colors.cream, fontWeight: '700' },
  logButton: {
    backgroundColor: colors.sage,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logButtonText: { color: colors.cream, fontSize: 16, fontWeight: '700' },
});
