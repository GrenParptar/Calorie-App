import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArchHeader } from '@/components/ArchHeader';
import { BohoCard } from '@/components/BohoCard';
import { MacroRing } from '@/components/MacroRing';
import { ProgressBar } from '@/components/ProgressBar';
import { colors, spacing, typography } from '@/theme/theme';
import { useUser } from '@/context/UserContext';
import { useLog } from '@/context/LogContext';

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function HomeScreen() {
  const { profile, plan } = useUser();
  const { today } = useLog();

  if (!profile || !plan) return null;

  const consumedCalories = today.foods.reduce((sum, f) => sum + f.calories, 0);
  const consumedProtein = today.foods.reduce((sum, f) => sum + f.proteinG, 0);
  const consumedCarbs = today.foods.reduce((sum, f) => sum + f.carbsG, 0);
  const consumedFat = today.foods.reduce((sum, f) => sum + f.fatG, 0);
  const waterMl = today.water.reduce((sum, w) => sum + w.amountMl, 0);
  const waterGoalMl = 2000;

  const remaining = plan.calories - consumedCalories;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ArchHeader title={`Hi, ${profile.name}`} subtitle="Here's today at a glance" />

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Calories</Text>
        <Text style={styles.bigNumber}>{Math.max(remaining, 0)}</Text>
        <Text style={typography.caption as any}>
          {remaining >= 0 ? 'kcal remaining' : 'kcal over goal'} · goal {plan.calories} kcal
        </Text>
        <View style={styles.spacer} />
        <ProgressBar progress={consumedCalories / plan.calories} color={colors.terracotta} />
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Macros</Text>
        <View style={styles.ringsRow}>
          <MacroRing label="Protein" current={consumedProtein} target={plan.proteinG} unit="g" color={colors.terracotta} />
          <MacroRing label="Carbs" current={consumedCarbs} target={plan.carbsG} unit="g" color={colors.sage} />
          <MacroRing label="Fat" current={consumedFat} target={plan.fatG} unit="g" color={colors.gold} />
        </View>
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Water</Text>
        <Text style={styles.bigNumber}>{(waterMl / 1000).toFixed(1)}L</Text>
        <Text style={typography.caption as any}>of {(waterGoalMl / 1000).toFixed(1)}L goal</Text>
        <View style={styles.spacer} />
        <ProgressBar progress={waterMl / waterGoalMl} color={colors.water} />
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
          today.foods.map((f) => (
            <View key={f.id} style={styles.foodRow}>
              <View style={{ flex: 1 }}>
                <Text style={typography.body as any}>{f.name}</Text>
                <Text style={typography.caption as any}>
                  {MEAL_LABELS[f.mealType]} · {f.quantity} {f.unit}
                </Text>
              </View>
              <Text style={typography.body as any}>{f.calories} kcal</Text>
            </View>
          ))
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
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
});
