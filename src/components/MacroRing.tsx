import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '@/theme/theme';

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  size?: number;
}

export function MacroRing({ label, current, target, unit, color, size = 84 }: MacroRingProps) {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <View>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.sand}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.centerText]}>
          <Text style={styles.value}>{Math.round(current)}</Text>
          <Text style={styles.unit}>/{Math.round(target)}{unit}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  centerText: { alignItems: 'center', justifyContent: 'center' },
  value: { ...typography.heading, fontSize: 16 },
  unit: { ...typography.caption, fontSize: 10 },
  label: { ...typography.label, marginTop: 6, textTransform: 'uppercase' },
});
