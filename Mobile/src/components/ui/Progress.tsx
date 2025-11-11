import React from 'react';
import {View, StyleSheet, ViewProps} from 'react-native';

interface ProgressProps extends ViewProps {
  value: number; // 0 to 100
  color?: string;
  height?: number;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  color = '#3b82f6',
  height = 8,
  style,
  ...props
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View
      style={[styles.container, {height}, style]}
      {...props}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedValue}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#262626',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    transition: 'width 0.3s ease',
  },
});

export default Progress;
