import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/theme';
import { UnitSystem } from '@/types';

interface UnitToggleProps {
  value: UnitSystem;
  onChange: (value: UnitSystem) => void;
}

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <View style={styles.row}>
      {(['metric', 'imperial'] as UnitSystem[]).map((option) => (
        <Pressable
          key={option}
          style={[styles.pill, value === option && styles.pillSelected]}
          onPress={() => onChange(option)}
        >
          <Text style={[styles.pillText, value === option && styles.pillTextSelected]}>
            {option === 'metric' ? 'Metric (cm/kg)' : 'Imperial (ft/lb)'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
  },
  pillSelected: { backgroundColor: colors.terracotta, borderColor: colors.terracotta },
  pillText: { ...typography.caption, color: colors.ink },
  pillTextSelected: { color: colors.cream, fontWeight: '700' },
});
