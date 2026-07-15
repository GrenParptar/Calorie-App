import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radii, spacing, typography } from '@/theme/theme';

interface WaterDropProps {
  filled: boolean;
  onPress?: () => void;
  size?: number;
}

export function WaterDrop({ filled, onPress, size = 34 }: WaterDropProps) {
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2 C12 2 5 11 5 15.5 A7 7 0 0 0 19 15.5 C19 11 12 2 12 2 Z"
          fill={filled ? colors.water : 'transparent'}
          stroke={colors.water}
          strokeWidth={1.5}
        />
      </Svg>
    </Pressable>
  );
}

interface WaterQuickAddProps {
  amountMl: number;
  label: string;
  onPress: () => void;
}

export function WaterQuickAdd({ amountMl, label, onPress }: WaterQuickAddProps) {
  return (
    <Pressable style={styles.quickAdd} onPress={onPress}>
      <Text style={styles.quickAddLabel}>+{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quickAdd: {
    backgroundColor: colors.waterLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  quickAddLabel: {
    ...typography.caption,
    color: colors.ink,
    fontWeight: '700',
  },
});
