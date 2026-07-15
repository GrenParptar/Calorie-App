import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArchHeader } from '@/components/ArchHeader';
import { BohoCard } from '@/components/BohoCard';
import { UnitToggle } from '@/components/UnitToggle';
import { colors, spacing, typography } from '@/theme/theme';
import { useUser } from '@/context/UserContext';
import { ACTIVITY_LABELS } from '@/utils/calculations';
import { formatHeight, formatWeight } from '@/utils/unitConversions';
import { UnitSystem } from '@/types';

export function ProfileScreen() {
  const { profile, plan, setProfile } = useUser();
  if (!profile || !plan) return null;

  const weightDelta = profile.goalWeightKg - profile.weightKg;
  const directionLabel = weightDelta < 0 ? 'lose' : weightDelta > 0 ? 'gain' : 'maintain';

  const handleUnitChange = (unitSystem: UnitSystem) => {
    setProfile({ ...profile, unitSystem });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ArchHeader title={profile.name} subtitle="Your plan, at a glance" />

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Units</Text>
        <View style={styles.spacer}>
          <UnitToggle value={profile.unitSystem} onChange={handleUnitChange} />
        </View>
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Profile</Text>
        <Row label="Age" value={`${profile.age}`} />
        <Row label="Height" value={formatHeight(profile.heightCm, profile.unitSystem)} />
        <Row label="Weight" value={formatWeight(profile.weightKg, profile.unitSystem)} />
        <Row label="Activity" value={ACTIVITY_LABELS[profile.activityLevel]} />
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Goal</Text>
        <Text style={[typography.body as any, styles.spacer]}>
          {directionLabel === 'maintain'
            ? 'Maintain current weight'
            : `${directionLabel === 'lose' ? 'Lose' : 'Gain'} ${formatWeight(Math.abs(weightDelta), profile.unitSystem)} over ${profile.goalTimeframeWeeks} weeks`}
        </Text>
        <Text style={typography.caption as any}>
          ≈ {formatWeight(Math.abs(plan.weeklyWeightChangeKg), profile.unitSystem)}/week
        </Text>
        {!plan.isTimeframeSafe && (
          <Text style={styles.warningText}>
            This pace exceeds the recommended safe rate of ~1% bodyweight/week.
          </Text>
        )}
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Daily Targets</Text>
        <Row label="BMR" value={`${plan.bmr} kcal`} />
        <Row label="TDEE (maintenance)" value={`${plan.tdee} kcal`} />
        <Row label="Calorie goal" value={`${plan.calories} kcal`} />
        <Row label="Protein" value={`${plan.proteinG} g`} />
        <Row label="Carbs" value={`${plan.carbsG} g`} />
        <Row label="Fat" value={`${plan.fatG} g`} />
        <Row label="Sugar limit" value={`${plan.sugarLimitG} g`} />
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Exercise Suggestion</Text>
        <Text style={[typography.body as any, styles.spacer]}>
          {plan.suggestedExerciseSessionsPerWeek} sessions/week · {plan.suggestedExerciseMinutesPerWeek} min/week
        </Text>
        <Text style={typography.caption as any}>
          Mix of cardio and strength training helps preserve lean mass while in a calorie deficit.
        </Text>
      </BohoCard>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={typography.caption as any}>{label}</Text>
      <Text style={typography.body as any}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  section: { marginBottom: spacing.md },
  spacer: { marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  warningText: { color: colors.rust, marginTop: spacing.sm, fontSize: 13 },
});
