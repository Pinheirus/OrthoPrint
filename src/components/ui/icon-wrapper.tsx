import React from 'react';
import { View } from 'react-native';
import { Colors } from '@/constants/tokens';

export type IconSizeVariant = 'inline' | 'status' | 'nav' | 'action' | 'hero';
export type IconColorRole =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'white';

export interface IconWrapperProps {
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  }>;
  size?: IconSizeVariant | number;
  color?: IconColorRole | string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  interactive?: boolean;
  className?: string;
  style?: any;
  accessibilityLabel?: string;
}

const PIXEL_SIZES: Record<IconSizeVariant, number> = {
  inline: 16,
  status: 20,
  nav: 24,
  action: 28,
  hero: 36,
};

const COLOR_MAP: Record<IconColorRole, string> = {
  primary: Colors.slate[900],
  secondary: Colors.slate[700],
  muted: Colors.slate[400],
  brand: Colors.primary[500],
  success: Colors.clinical.success.base,
  warning: Colors.clinical.warning.base,
  error: Colors.clinical.error.base,
  white: '#FFFFFF',
};

/**
 * IconWrapper
 * Standardized container for Phosphor icons with sizing tokens,
 * clinical color mapping, and touch target compliance via NativeWind.
 */
export function IconWrapper({
  icon: IconComponent,
  size = 'status',
  color = 'secondary',
  weight = 'regular',
  interactive = false,
  className = '',
  style,
  accessibilityLabel,
  ...props
}: IconWrapperProps) {
  const pixelSize = typeof size === 'number' ? size : PIXEL_SIZES[size] ?? PIXEL_SIZES.status;
  const resolvedColor = (COLOR_MAP as Record<string, string>)[color] ?? color;

  return (
    <View
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      className={`items-center justify-center ${interactive ? 'min-h-touch min-w-touch' : ''} ${className}`}
      style={style}
      {...props}>
      <IconComponent
        size={pixelSize}
        color={resolvedColor}
        weight={weight}
      />
    </View>
  );
}
