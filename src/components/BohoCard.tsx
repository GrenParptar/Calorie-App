import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radii, shadow, spacing } from '@/theme/theme';

export function BohoCard({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
});
