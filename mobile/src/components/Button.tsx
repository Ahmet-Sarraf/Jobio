import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/spacing';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = ({
  title,
  variant = 'primary',
  loading = false,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.textSecondary;
    if (variant === 'primary') return colors.primary;
    if (variant === 'secondary') return colors.secondary;
    return colors.surface;
  };

  const getTextColor = () => {
    if (disabled) return colors.surface;
    return colors.text;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {title ? <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text> : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  outline: {
    backgroundColor: colors.surface,
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
});
