import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, spacing, typography } from '@/theme/theme';

interface ArchHeaderProps {
  title: string;
  subtitle?: string;
}

// A simple sunrise-over-arch motif, evocative of boho / desert-terracotta design.
export function ArchHeader({ title, subtitle }: ArchHeaderProps) {
  return (
    <View style={styles.container}>
      <Svg width={72} height={56} viewBox="0 0 72 56" style={styles.svg}>
        <Path
          d="M6 52 V28 A30 30 0 0 1 66 28 V52"
          fill="none"
          stroke={colors.terracotta}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Circle cx={36} cy={26} r={9} fill={colors.gold} opacity={0.9} />
        <Path d="M2 52 H70" stroke={colors.sage} strokeWidth={3} strokeLinecap="round" />
      </Svg>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  svg: {
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
