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
  radius?: 'sm' | 'md' | 'glass' | 'lg' | '2xl' | '3xl' | '4xl' | 'none';
  /**
   * Elevation preset for soft shadows
   */
  elevation?: 'none' | 'soft' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

const DENSITY_BG_CLASSES = {
  subtle: 'bg-white/70',
  standard: 'bg-white/80',
  dense: 'bg-white/85',
};

const RADIUS_CLASSES = {
  sm: 'rounded-2xl',
  md: 'rounded-3xl',
  glass: 'rounded-4xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  '4xl': 'rounded-4xl',
  lg: 'rounded-4xl',
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
 * Enforces true semi-transparent frosted glass (bg-white/80) with Expo BlurView
 * and crisp semi-transparent borders (border-white/60).
 */
export function GlassSurface({
  children,
  density = 'standard',
  intensity = 50,
  radius = '4xl',
  elevation = 'soft',
  className = '',
  style,
  ...props
}: GlassSurfaceProps) {
  const isWeb = Platform.OS === 'web';
  const densityBg = DENSITY_BG_CLASSES[density] ?? DENSITY_BG_CLASSES.standard;
  const radiusClass = RADIUS_CLASSES[radius] ?? RADIUS_CLASSES['4xl'];
  const elevationClass = ELEVATION_CLASSES[elevation] ?? ELEVATION_CLASSES.soft;

  return (
    <View
      className={`relative ${radiusClass} ${elevationClass} ${className}`}
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
          className={`absolute inset-0 ${radiusClass} overflow-hidden`}
        />
      )}

      {/* Semi-transparent white wash & crisp semi-transparent border */}
      <View
        pointerEvents="none"
        className={`absolute inset-0 ${radiusClass} border border-white/60 ${densityBg} overflow-hidden`}
      />

      {/* Children content container */}
      <View className="z-10">{children}</View>
    </View>
  );
}
