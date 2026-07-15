import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArchHeader } from '@/components/ArchHeader';
import { BohoCard } from '@/components/BohoCard';
import { ProgressBar } from '@/components/ProgressBar';
import { WaterDrop, WaterQuickAdd } from '@/components/WaterDrop';
import { colors, spacing, typography } from '@/theme/theme';
import { useLog } from '@/context/LogContext';
import { useUser } from '@/context/UserContext';
import { formatVolume, mlToFlOz } from '@/utils/unitConversions';

const GOAL_ML = 2000;
const CUP_ML = 250;
const QUICK_ADDS_ML = [150, 250, 500];

export function WaterScreen() {
  const { today, addWater, removeWater } = useLog();
  const { profile } = useUser();
  const unitSystem = profile?.unitSystem ?? 'metric';
  const totalMl = today.water.reduce((sum, w) => sum + w.amountMl, 0);
  const cupsFilled = Math.floor(totalMl / CUP_ML);
  const totalCups = Math.ceil(GOAL_ML / CUP_ML);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ArchHeader title="Water" subtitle="Stay in bloom, stay hydrated" />

      <BohoCard style={styles.section}>
        <Text style={styles.bigNumber}>{formatVolume(totalMl, unitSystem)}</Text>
        <Text style={typography.caption as any}>of {formatVolume(GOAL_ML, unitSystem)} daily goal</Text>
        <View style={styles.spacer} />
        <ProgressBar progress={totalMl / GOAL_ML} color={colors.water} />

        <View style={styles.dropsRow}>
          {Array.from({ length: totalCups }).map((_, i) => (
            <WaterDrop
              key={i}
              filled={i < cupsFilled}
              onPress={() => (i < cupsFilled ? undefined : addWater(CUP_ML))}
            />
          ))}
        </View>
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Quick add</Text>
        <View style={styles.quickRow}>
          {QUICK_ADDS_ML.map((amountMl) => (
            <WaterQuickAdd
              key={amountMl}
              amountMl={amountMl}
              label={unitSystem === 'metric' ? `${amountMl}ml` : `${mlToFlOz(amountMl)}fl oz`}
              onPress={() => addWater(amountMl)}
            />
          ))}
        </View>
      </BohoCard>

      <BohoCard style={styles.section}>
        <Text style={typography.heading as any}>Today's log</Text>
        {today.water.length === 0 ? (
          <Text style={[typography.caption as any, styles.spacer]}>No water logged yet.</Text>
        ) : (
          today.water
            .slice()
            .reverse()
            .map((w) => (
              <View key={w.id} style={styles.logRow}>
                <Text style={typography.body as any}>{formatVolume(w.amountMl, unitSystem)}</Text>
                <Text style={typography.caption as any} onPress={() => removeWater(w.id)}>
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
  bigNumber: { fontSize: 36, fontWeight: '800', color: colors.ink },
  spacer: { marginTop: spacing.sm },
  dropsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  quickRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
});
