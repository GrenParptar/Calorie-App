import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArchHeader } from '@/components/ArchHeader';
import { BohoCard } from '@/components/BohoCard';
import { colors, radii, spacing, typography } from '@/theme/theme';
import { calculateCaloriesBurned, ExerciseMet, searchExerciseMets } from '@/data/exerciseMets';
import { useUser } from '@/context/UserContext';
import { useLog } from '@/context/LogContext';

export function ExerciseScreen() {
  const { profile } = useUser();
  const { today, addExercise, removeExercise } = useLog();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ExerciseMet | null>(null);
  const [durationMinutes, setDurationMinutes] = useState('30');

  const results = searchExerciseMets(query);
  const weightKg = profile?.weightKg ?? 70;
  const duration = Number(durationMinutes) || 0;
  const estimatedCalories = selected ? calculateCaloriesBurned(selected.met, weightKg, duration) : 0;

  const handleLog = () => {
    if (!selected || duration <= 0) return;
    addExercise(selected.name, selected.met, duration, estimatedCalories);
    setSelected(null);
    setQuery('');
    setDurationMinutes('30');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ArchHeader title="Exercise" subtitle="Log a workout, see calories burned" />

      <BohoCard style={styles.section}>
        <TextInput
          style={styles.input}
          placeholder="Search activities e.g. running, yoga, cycling"
          placeholderTextColor={colors.inkSoft}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelected(null);
          }}
        />

        {!selected &&
          results.slice(0, 6).map((item) => (
            <Pressable key={item.name} style={styles.resultRow} onPress={() => setSelected(item)}>
              <Text style={typography.body as any}>{item.name}</Text>
              <Text style={typography.caption as any}>{item.met} MET</Text>
            </Pressable>
          ))}

        {query.length > 0 && results.length === 0 && !selected && (
          <Text style={[typography.caption as any, styles.spacer]}>
            No match in the activity database — try a simpler term like "run" or "bike".
          </Text>
        )}
      </BohoCard>

      {selected && (
        <BohoCard style={styles.section}>
          <Text style={typography.heading as any}>{selected.name}</Text>
          <Text style={typography.caption as any}>{selected.met} MET · Compendium of Physical Activities</Text>

          <Text style={[typography.label as any, styles.spacer]}>DURATION (MINUTES)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={durationMinutes}
            onChangeText={setDurationMinutes}
          />

          <Text style={[styles.bigNumber, styles.spacer]}>{estimatedCalories} kcal</Text>
          <Text style={typography.caption as any}>estimated burn, based on your {weightKg.toFixed(0)} kg weight</Text>

          <Pressable style={styles.logButton} onPress={handleLog}>
            <Text style={styles.logButtonText}>Log workout</Text>
          </Pressable>
        </BohoCard>
      )}

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Today's Workouts</Text>
        {today.exercises.length === 0 ? (
          <Text style={[typography.caption as any, styles.spacer]}>Nothing logged yet.</Text>
        ) : (
          today.exercises.map((ex) => (
            <View key={ex.id} style={styles.logRow}>
              <View style={{ flex: 1 }}>
                <Text style={typography.body as any}>{ex.name}</Text>
                <Text style={typography.caption as any}>{ex.durationMinutes} min · {ex.caloriesBurned} kcal</Text>
              </View>
              <Text style={typography.caption as any} onPress={() => removeExercise(ex.id)}>
                Remove
              </Text>
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
  spacer: { marginTop: spacing.sm },
  bigNumber: { fontSize: 32, fontWeight: '800', color: colors.ink },
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  logButton: {
    backgroundColor: colors.sage,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logButtonText: { color: colors.cream, fontSize: 16, fontWeight: '700' },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
});
