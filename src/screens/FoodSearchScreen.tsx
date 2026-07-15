import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArchHeader } from '@/components/ArchHeader';
import { BohoCard } from '@/components/BohoCard';
import { colors, radii, spacing, typography } from '@/theme/theme';
import { aiResultToFoodEntry, AiFoodResult, scaleFoodResult } from '@/services/aiFoodService';
import { searchFood } from '@/services/foodLookupService';
import { useLog } from '@/context/LogContext';
import { FoodEntry } from '@/types';

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

export function FoodSearchScreen() {
  const { addFood } = useLog();
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState<FoodEntry['mealType']>('breakfast');
  const [baseResult, setBaseResult] = useState<AiFoodResult | null>(null);
  const [amountText, setAmountText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);

  const displayedResult: AiFoodResult | null = (() => {
    if (!baseResult) return null;
    const amount = Number(amountText);
    if (!amountText || Number.isNaN(amount) || amount <= 0) return baseResult;
    return scaleFoodResult(baseResult, amount);
  })();

  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    setBaseResult(null);
    setLogged(false);
    try {
      const found = await searchFood(query);
      setBaseResult(found);
      setAmountText(String(found.quantity));
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLog = () => {
    if (!displayedResult) return;
    addFood(aiResultToFoodEntry(displayedResult, mealType));
    setLogged(true);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ArchHeader title="Search Food" subtitle="Name-brand or generic — we'll find the real numbers" />

      <BohoCard style={styles.section}>
        <TextInput
          style={styles.input}
          placeholder='e.g. "Quest protein bar" or "2 scrambled eggs"'
          placeholderTextColor={colors.inkSoft}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
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

      {displayedResult && (
        <BohoCard style={styles.section}>
          <Text style={typography.heading as any}>{displayedResult.name}</Text>
          {displayedResult.brand ? <Text style={typography.caption as any}>{displayedResult.brand}</Text> : null}
          <Text style={[typography.caption as any, styles.spacer]}>
            source: {SOURCE_LABELS[displayedResult.source]} · confidence: {displayedResult.confidence}
          </Text>

          <Text style={[typography.label as any, styles.spacer]}>AMOUNT ({displayedResult.unit})</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amountText}
            onChangeText={setAmountText}
          />

          <View style={styles.macroGrid}>
            <MacroStat label="Calories" value={`${displayedResult.calories}`} />
            <MacroStat label="Protein" value={`${displayedResult.proteinG}g`} />
            <MacroStat label="Carbs" value={`${displayedResult.carbsG}g`} />
            <MacroStat label="Fat" value={`${displayedResult.fatG}g`} />
            <MacroStat label="Sugar" value={`${displayedResult.sugarG}g`} />
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

          <Pressable style={styles.logButton} onPress={handleLog}>
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
