import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { ArchHeader } from '@/components/ArchHeader';
import { BohoCard } from '@/components/BohoCard';
import { UnitToggle } from '@/components/UnitToggle';
import { colors, radii, spacing, typography } from '@/theme/theme';
import { ActivityLevel, Gender, GoalDirection, UnitSystem, UserProfile } from '@/types';
import { ACTIVITY_LABELS, safeMinWeeks } from '@/utils/calculations';
import { feetInchesToCm, lbToKg } from '@/utils/unitConversions';
import { useUser } from '@/context/UserContext';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

const GOALS: { value: GoalDirection; label: string }[] = [
  { value: 'lose', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain', label: 'Gain weight' },
];

const ACTIVITIES: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

function Pill<T extends string>({
  value,
  label,
  selected,
  onPress,
}: {
  value: T;
  label: string;
  selected: boolean;
  onPress: (value: T) => void;
}) {
  return (
    <Pressable
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { setProfile } = useUser();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [age, setAge] = useState('28');

  // Metric inputs
  const [heightCm, setHeightCm] = useState('165');
  const [weightKg, setWeightKg] = useState('68');
  const [goalWeightKg, setGoalWeightKg] = useState('62');

  // Imperial inputs
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('5');
  const [weightLb, setWeightLb] = useState('150');
  const [goalWeightLb, setGoalWeightLb] = useState('137');

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('light');
  const [goalDirection, setGoalDirection] = useState<GoalDirection>('lose');
  const [goalTimeframeWeeks, setGoalTimeframeWeeks] = useState('12');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const isImperial = unitSystem === 'imperial';

    const heightCmValue = isImperial
      ? feetInchesToCm(Number(heightFeet), Number(heightInches))
      : Number(heightCm);
    const weightKgValue = isImperial ? lbToKg(Number(weightLb)) : Number(weightKg);
    const goalWeightKgValue = isImperial ? lbToKg(Number(goalWeightLb)) : Number(goalWeightKg);

    const parsed = {
      age: Number(age),
      heightCm: heightCmValue,
      weightKg: weightKgValue,
      goalWeightKg: goalWeightKgValue,
      goalTimeframeWeeks: Number(goalTimeframeWeeks),
    };

    if (Object.values(parsed).some((v) => Number.isNaN(v) || v <= 0)) {
      setError('Please fill in all fields with valid positive numbers.');
      return;
    }

    if (goalDirection === 'lose' && parsed.goalWeightKg >= parsed.weightKg) {
      setError('Goal weight should be less than current weight for a weight-loss plan.');
      return;
    }

    const weightDelta = parsed.goalWeightKg - parsed.weightKg;
    const minWeeks = safeMinWeeks(weightDelta, parsed.weightKg);
    if (goalDirection === 'lose' && parsed.goalTimeframeWeeks < minWeeks) {
      setError(
        `That timeframe is unsafe for the amount of weight — try at least ${minWeeks} weeks (~1% bodyweight/week).`
      );
      return;
    }

    setError(null);

    const profile: UserProfile = {
      name: name.trim() || 'Friend',
      gender,
      age: parsed.age,
      heightCm: parsed.heightCm,
      weightKg: parsed.weightKg,
      activityLevel,
      goalDirection,
      goalWeightKg: parsed.goalWeightKg,
      goalTimeframeWeeks: parsed.goalTimeframeWeeks,
      unitSystem,
    };

    await setProfile(profile);
    onComplete();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ArchHeader title="Welcome to Bloom" subtitle="Let's personalize your plan" />

      <BohoCard style={styles.section}>
        <Text style={typography.label as any}>UNITS</Text>
        <View style={styles.fieldSpacing}>
          <UnitToggle value={unitSystem} onChange={setUnitSystem} />
        </View>

        <Text style={[typography.label as any, styles.fieldSpacing]}>YOUR NAME</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Sam" placeholderTextColor={colors.inkSoft} />

        <Text style={[typography.label as any, styles.fieldSpacing]}>GENDER</Text>
        <View style={styles.row}>
          {GENDERS.map((g) => (
            <Pill key={g.value} value={g.value} label={g.label} selected={gender === g.value} onPress={setGender} />
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={typography.label as any}>AGE</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />
          </View>
          <View style={styles.half}>
            {unitSystem === 'metric' ? (
              <>
                <Text style={typography.label as any}>HEIGHT (CM)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} />
              </>
            ) : (
              <>
                <Text style={typography.label as any}>HEIGHT (FT / IN)</Text>
                <View style={styles.row}>
                  <TextInput style={[styles.input, styles.smallInput]} keyboardType="numeric" value={heightFeet} onChangeText={setHeightFeet} />
                  <TextInput style={[styles.input, styles.smallInput]} keyboardType="numeric" value={heightInches} onChangeText={setHeightInches} />
                </View>
              </>
            )}
          </View>
        </View>

        <Text style={[typography.label as any, styles.fieldSpacing]}>
          CURRENT WEIGHT ({unitSystem === 'metric' ? 'KG' : 'LB'})
        </Text>
        {unitSystem === 'metric' ? (
          <TextInput style={styles.input} keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} />
        ) : (
          <TextInput style={styles.input} keyboardType="numeric" value={weightLb} onChangeText={setWeightLb} />
        )}

        <Text style={[typography.label as any, styles.fieldSpacing]}>ACTIVITY LEVEL</Text>
        <View style={styles.wrapRow}>
          {ACTIVITIES.map((a) => (
            <Pill key={a} value={a} label={ACTIVITY_LABELS[a].split(' (')[0]} selected={activityLevel === a} onPress={setActivityLevel} />
          ))}
        </View>
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Your Goal</Text>
        <View style={[styles.row, styles.fieldSpacing]}>
          {GOALS.map((g) => (
            <Pill key={g.value} value={g.value} label={g.label} selected={goalDirection === g.value} onPress={setGoalDirection} />
          ))}
        </View>

        {goalDirection !== 'maintain' && (
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={[typography.label as any, styles.fieldSpacing]}>
                GOAL WEIGHT ({unitSystem === 'metric' ? 'KG' : 'LB'})
              </Text>
              {unitSystem === 'metric' ? (
                <TextInput style={styles.input} keyboardType="numeric" value={goalWeightKg} onChangeText={setGoalWeightKg} />
              ) : (
                <TextInput style={styles.input} keyboardType="numeric" value={goalWeightLb} onChangeText={setGoalWeightLb} />
              )}
            </View>
            <View style={styles.half}>
              <Text style={[typography.label as any, styles.fieldSpacing]}>TIMEFRAME (WEEKS)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={goalTimeframeWeeks} onChangeText={setGoalTimeframeWeeks} />
            </View>
          </View>
        )}
      </BohoCard>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.cta} onPress={handleSubmit}>
        <Text style={styles.ctaText}>Build my plan</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  section: { marginBottom: spacing.md },
  fieldSpacing: { marginTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  half: { flex: 1 },
  smallInput: { flex: 1, marginTop: 0 },
  input: {
    backgroundColor: colors.cream,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    color: colors.ink,
    fontSize: 15,
  },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
  },
  pillSelected: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  pillText: { ...typography.caption, color: colors.ink },
  pillTextSelected: { color: colors.cream, fontWeight: '700' },
  error: {
    color: colors.rust,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  cta: {
    backgroundColor: colors.terracottaDark,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  ctaText: { color: colors.cream, fontSize: 16, fontWeight: '700' },
});
