import React from 'react';
import { View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/tokens';

export interface ClinicalBackgroundProps extends ViewProps {
  children?: React.ReactNode;
}

/**
 * ClinicalBackground
 * Provides the soft gradient from clinical tint to pure white
 * that gives backdrop blur on glass panels substance and diffusion.
 */
export function ClinicalBackground({
  children,
  className = '',
  style,
  ...props
}: ClinicalBackgroundProps & { className?: string }) {
  return (
    <View className={`flex-1 bg-slate-50 ${className}`} style={style} {...props}>
      <LinearGradient
        colors={[Colors.background.gradientTop, Colors.background.gradientBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.85 }}
        className="absolute inset-0"
      />
      {children}
    </View>
  );
}
