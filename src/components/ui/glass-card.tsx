import React from 'react';
import {
  Platform,
  Pressable,
  PressableProps,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Motion } from '@/constants/tokens';

export interface GlassCardProps extends Omit<PressableProps, 'style'> {
  density?: 'subtle' | 'standard' | 'dense';
  intensity?: number;
  radius?: 'sm' | 'md' | 'glass' | 'lg' | '2xl' | '3xl' | '4xl' | 'none';
  elevation?: 'none' | 'soft' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  minTouchTarget?: boolean;
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

const DENSITY_BG_CLASSES = {
  subtle:   'bg-white/50',
  standard: 'bg-white/60',
  dense:    'bg-white/70',
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

// Elevation is now handled purely via inline shadowColor/shadowOpacity/elevation
// so it is cross-platform consistent. NativeWind shadow classes are not used.
const ELEVATION_INLINE: Record<GlassCardProps['elevation'] & string, object> = {
  none: {},
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

/**
 * GlassCard
 * Primary glass container for scan cards, action triggers, and clinical records.
 * Uses ultra-rounded friendly curves (rounded-4xl) with genuine frosted glassmorphism:
 * Expo BlurView underlay (intensity 60), semi-transparent white wash (bg-white/60),
 * and a crisp defining hairline border (border-white/60).
 */
export function GlassCard({
  children,
  density = 'standard',
  intensity = 60,
  radius = '4xl',
  elevation = 'soft',
  interactive = false,
  minTouchTarget = true,
  className = '',
  style,
  onPress,
  ...props
}: GlassCardProps) {
  const pressedScale = useSharedValue(1);
  const pressedOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressedScale.value }],
    opacity: pressedOpacity.value,
  }));

  const handlePressIn = () => {
    if (!interactive && !onPress) return;
    pressedScale.value = withTiming(0.985, {
      duration: Motion.durations.tap,
    });
    pressedOpacity.value = withTiming(0.96, {
      duration: Motion.durations.tap,
    });
  };

  const handlePressOut = () => {
    if (!interactive && !onPress) return;
    pressedScale.value = withTiming(1, {
      duration: Motion.durations.tap,
    });
    pressedOpacity.value = withTiming(1, {
      duration: Motion.durations.tap,
    });
  };

  const isWeb = Platform.OS === 'web';
  const isClickable = interactive || !!onPress;

  const densityBg   = DENSITY_BG_CLASSES[density]   ?? DENSITY_BG_CLASSES.standard;
  const radiusClass  = RADIUS_CLASSES[radius]         ?? RADIUS_CLASSES['4xl'];
  const shadowStyle  = ELEVATION_INLINE[elevation]    ?? ELEVATION_INLINE.soft;
  const touchClass   = minTouchTarget ? 'min-h-touch min-w-touch' : '';

  return (
    <Animated.View
      style={[
        shadowStyle,
        isClickable ? animatedStyle : undefined,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isClickable}
        className={`relative ${radiusClass} ${touchClass} ${className}`}
        style={
          isWeb
            ? ({
                backdropFilter: `blur(${Math.round(intensity * 0.4)}px)`,
                WebkitBackdropFilter: `blur(${Math.round(intensity * 0.4)}px)`,
                cursor: isClickable ? 'pointer' : 'default',
              } as any)
            : undefined
        }
        {...props}
      >
        {!isWeb && (
          <BlurView
            intensity={intensity}
            tint="light"
            className={`absolute inset-0 ${radiusClass} overflow-hidden`}
          />
        )}

        {/* Semi-transparent white wash & crisp defining hairline border */}
        <View
          pointerEvents="none"
          className={`absolute inset-0 ${radiusClass} border border-white/60 ${densityBg} overflow-hidden`}
        />

        {/* Top specular highlight — simulates light catching the card's top glass edge */}
        <View
          pointerEvents="none"
          className={`absolute top-0 left-4 right-4 h-px bg-white/70 ${radiusClass}`}
        />

        <View className="z-10">{children}</View>
      </Pressable>
    </Animated.View>
  );
}
