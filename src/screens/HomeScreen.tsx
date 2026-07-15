import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArchHeader } from '@/components/ArchHeader';
import { BohoCard } from '@/components/BohoCard';
import { MacroRing } from '@/components/MacroRing';
import { ProgressBar } from '@/components/ProgressBar';
import { colors, spacing, typography } from '@/theme/theme';
import { useUser } from '@/context/UserContext';
import { useLog } from '@/context/LogContext';
import { FoodEntry, MealType } from '@/types';
import { formatVolume } from '@/utils/unitConversions';

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

function groupByMeal(foods: FoodEntry[]): Record<MealType, FoodEntry[]> {
  const grouped: Record<MealType, FoodEntry[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
  for (const food of foods) grouped[food.mealType].push(food);
  return grouped;
}

export function HomeScreen() {
  const { profile, plan } = useUser();
  const { today } = useLog();

  if (!profile || !plan) return null;

  const consumedCalories = today.foods.reduce((sum, f) => sum + (f.calories ?? 0), 0);
  const consumedProtein = today.foods.reduce((sum, f) => sum + (f.proteinG ?? 0), 0);
  const consumedCarbs = today.foods.reduce((sum, f) => sum + (f.carbsG ?? 0), 0);
  const consumedFat = today.foods.reduce((sum, f) => sum + (f.fatG ?? 0), 0);
  const consumedSugar = today.foods.reduce((sum, f) => sum + (f.sugarG ?? 0), 0);
  const waterMl = today.water.reduce((sum, w) => sum + w.amountMl, 0);
  const waterGoalMl = 2000;
  const caloriesBurned = today.exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

  const remaining = plan.calories - consumedCalories + caloriesBurned;
  const groupedFoods = groupByMeal(today.foods);
  const isOverCalorieBudget = consumedCalories > plan.calories;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ArchHeader title={`Hi, ${profile.name}`} subtitle="Here's today at a glance" />

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Calories</Text>
        <Text style={styles.bigNumber}>{Math.max(remaining, 0)}</Text>
        <Text style={typography.caption as any}>
          {remaining >= 0 ? 'kcal remaining' : 'kcal over goal'} · goal {plan.calories} kcal
          {caloriesBurned > 0 ? ` + ${caloriesBurned} burned` : ''}
        </Text>
        <View style={styles.spacer} />
        <ProgressBar
          progress={consumedCalories / plan.calories}
          color={isOverCalorieBudget ? colors.rust : colors.terracotta}
        />
        {isOverCalorieBudget && <Text style={styles.warningText}>Over your daily calorie goal</Text>}
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Macros</Text>
        <View style={styles.ringsRow}>
          <MacroRing label="Protein" current={consumedProtein} target={plan.proteinG} unit="g" color={colors.terracotta} size={68} />
          <MacroRing label="Carbs" current={consumedCarbs} target={plan.carbsG} unit="g" color={colors.sage} size={68} />
          <MacroRing label="Fat" current={consumedFat} target={plan.fatG} unit="g" color={colors.gold} size={68} />
          <MacroRing label="Sugar" current={consumedSugar} target={plan.sugarLimitG} unit="g" color={colors.rust} size={68} />
        </View>
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Water</Text>
        <Text style={styles.bigNumber}>{formatVolume(waterMl, profile.unitSystem)}</Text>
        <Text style={typography.caption as any}>of {formatVolume(waterGoalMl, profile.unitSystem)} goal</Text>
        <View style={styles.spacer} />
        <ProgressBar progress={waterMl / waterGoalMl} color={colors.water} />
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Exercise</Text>
        <Text style={styles.bigNumber}>{caloriesBurned}</Text>
        <Text style={typography.caption as any}>kcal burned today</Text>
        {today.exercises.length > 0 && (
          <View style={styles.spacer}>
            {today.exercises.map((ex) => (
              <View key={ex.id} style={styles.foodRow}>
                <Text style={typography.body as any}>{ex.name}</Text>
                <Text style={typography.caption as any}>{ex.durationMinutes} min · {ex.caloriesBurned} kcal</Text>
              </View>
            ))}
          </View>
        )}
      </BohoCard>

      {!plan.isTimeframeSafe && (
        <BohoCard style={[styles.section, styles.warningCard]}>
          <Text style={styles.warningText}>
            Your timeframe implies faster loss than the recommended safe pace (~1% bodyweight/week).
            Consider extending your goal date in your profile.
          </Text>
        </BohoCard>
      )}

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Today's Food</Text>
        {today.foods.length === 0 ? (
          <Text style={[typography.caption as any, styles.spacer]}>Nothing logged yet — search for a food to get started.</Text>
        ) : (
          MEAL_ORDER.filter((meal) => groupedFoods[meal].length > 0).map((meal) => {
            const mealCalories = groupedFoods[meal].reduce((sum, f) => sum + f.calories, 0);
            return (
              <View key={meal} style={styles.mealSection}>
                <View style={styles.mealHeaderRow}>
                  <Text style={typography.label as any}>{MEAL_LABELS[meal].toUpperCase()}</Text>
                  <Text style={typography.caption as any}>{mealCalories} kcal</Text>
                </View>
                {groupedFoods[meal].map((f) => (
                  <View key={f.id} style={styles.foodRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={typography.body as any}>{f.name}</Text>
                      <Text style={typography.caption as any}>{f.quantity} {f.unit}</Text>
                    </View>
                    <Text style={typography.body as any}>{f.calories} kcal</Text>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </BohoCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  section: { marginBottom: spacing.md },
  bigNumber: { fontSize: 36, fontWeight: '800', color: colors.ink, marginTop: spacing.xs },
  spacer: { marginTop: spacing.sm },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  warningCard: { backgroundColor: '#F3E3CE', borderColor: colors.warning },
  warningText: { ...typography.caption, color: colors.rust },
  mealSection: { marginTop: spacing.md },
  mealHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
});
