import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '@/theme/theme';

interface ProgressBarProps {
  progress: number; // 0..1
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = colors.terracotta, height = 10 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(progress, 1));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.sand,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radii.pill,
  },
});
