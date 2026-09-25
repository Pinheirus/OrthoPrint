import React from 'react';
import { Platform, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

export interface GlassSurfaceProps extends ViewProps {
  /**
   * Opacity density variant:
   * - standard: 90% opacity (default) - balanced clinical clarity
   * - dense: 94% opacity - higher contrast for dense clinical tables/forms
   * - subtle: 85% opacity - lighter feel for secondary or nested containers
   */
  density?: 'subtle' | 'standard' | 'dense';
  /**
   * Blur intensity (0-100). Default is 25 for subtle, readable clinical diffusion.
   */
  intensity?: number;
  /**
   * Border radius preset
   */
  radius?: 'sm' | 'md' | 'glass' | 'lg' | '2xl' | 'none';
  /**
   * Elevation preset for soft shadows
   */
  elevation?: 'none' | 'soft' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

const DENSITY_BG_CLASSES = {
  subtle: 'bg-glass-surface-subtle',
  standard: 'bg-glass-surface',
  dense: 'bg-glass-surface-dense',
};

const RADIUS_CLASSES = {
  sm: 'rounded-glass-sm',
  md: 'rounded-glass-sm',
  glass: 'rounded-2xl',
  '2xl': 'rounded-2xl',
  lg: 'rounded-glass-lg',
  none: 'rounded-none',
};

const ELEVATION_CLASSES = {
  none: '',
  soft: 'shadow-soft',
  sm: 'shadow-glass-sm',
  md: 'shadow-glass-md',
  lg: 'shadow-glass-lg',
};

/**
 * GlassSurface
 * Foundational glassmorphism primitive.
 * Enforces high opacity (85-94%) and crisp semi-transparent borders for clinical legibility via NativeWind.
 */
export function GlassSurface({
  children,
  density = 'standard',
  intensity = 25,
  radius = '2xl',
  elevation = 'soft',
  className = '',
  style,
  ...props
}: GlassSurfaceProps) {
  const isWeb = Platform.OS === 'web';
  const densityBg = DENSITY_BG_CLASSES[density] ?? DENSITY_BG_CLASSES.standard;
  const radiusClass = RADIUS_CLASSES[radius] ?? RADIUS_CLASSES['2xl'];
  const elevationClass = ELEVATION_CLASSES[elevation] ?? ELEVATION_CLASSES.soft;

  return (
    <View
      className={`overflow-hidden relative ${radiusClass} ${elevationClass} ${className}`}
      style={[
        isWeb && ({
          backdropFilter: `blur(${Math.round(intensity * 0.4)}px)`,
          WebkitBackdropFilter: `blur(${Math.round(intensity * 0.4)}px)`,
        } as any),
        style,
      ]}
      {...props}>
      {/* Native BlurView underlay */}
      {!isWeb && (
        <BlurView
          intensity={intensity}
          tint="light"
          className={`absolute inset-0 ${radiusClass}`}
        />
      )}

      {/* Near-opaque high-contrast clinical white wash & 1px crisp border */}
      <View
        pointerEvents="none"
        className={`absolute inset-0 ${radiusClass} border border-glass-border ${densityBg}`}
      />

      {/* Children content container */}
      <View className="z-10">{children}</View>
    </View>
  );
}
