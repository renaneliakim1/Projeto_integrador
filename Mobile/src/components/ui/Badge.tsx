import React from 'react';
import {View, Text, StyleSheet, ViewStyle, TextStyle, ViewProps} from 'react-native';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  style,
  ...props
}) => {
  return (
    <View style={[styles.badge, styles[`badge_${variant}`], style]} {...props}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badge_default: {
    backgroundColor: '#3b82f6',
  },
  badge_secondary: {
    backgroundColor: '#f59e0b',
  },
  badge_destructive: {
    backgroundColor: '#ef4444',
  },
  badge_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#262626',
  },
  badge_success: {
    backgroundColor: '#22c55e',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  text_default: {
    color: '#ffffff',
  },
  text_secondary: {
    color: '#ffffff',
  },
  text_destructive: {
    color: '#ffffff',
  },
  text_outline: {
    color: '#fafafa',
  },
  text_success: {
    color: '#ffffff',
  },
});

export default Badge;
