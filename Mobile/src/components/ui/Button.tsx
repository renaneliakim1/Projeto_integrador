import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'game'
  | 'success'
  | 'warning'
  | 'energy';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  children,
  loading = false,
  disabled = false,
  style,
  ...props
}) => {
  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    disabled && styles.disabled,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
  ];

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? '#3b82f6'
              : '#ffffff'
          }
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  // Variants
  variant_default: {
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  variant_destructive: {
    backgroundColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#262626',
  },
  variant_secondary: {
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_link: {
    backgroundColor: 'transparent',
  },
  variant_game: {
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  variant_success: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  variant_warning: {
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  variant_energy: {
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  // Sizes
  size_default: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  size_lg: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  size_icon: {
    width: 40,
    height: 40,
    padding: 0,
  },
  // Text styles
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  text_default: {
    color: '#ffffff',
  },
  text_destructive: {
    color: '#ffffff',
  },
  text_outline: {
    color: '#fafafa',
  },
  text_secondary: {
    color: '#ffffff',
  },
  text_ghost: {
    color: '#3b82f6',
  },
  text_link: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  text_game: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  text_success: {
    color: '#ffffff',
  },
  text_warning: {
    color: '#ffffff',
  },
  text_energy: {
    color: '#ffffff',
  },
  // Text sizes
  textSize_default: {
    fontSize: 14,
  },
  textSize_sm: {
    fontSize: 12,
  },
  textSize_lg: {
    fontSize: 16,
  },
  textSize_icon: {
    fontSize: 14,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
