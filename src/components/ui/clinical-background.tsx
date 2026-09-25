import { StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/tokens';

export interface ClinicalBackgroundProps extends ViewProps {
  children?: React.ReactNode;
}

/**
 * ClinicalBackground
 * Provides the soft gradient from clinical sky tint to pure white
 * that gives backdrop blur on glass panels substance and diffusion,
 * matching the rich ambient background in the reference design.
 */
export function ClinicalBackground({
  children,
  className = '',
  style,
  ...props
}: ClinicalBackgroundProps & { className?: string }) {
  return (
    <View className={`flex-1 bg-sky-100 ${className}`} style={style} {...props}>
      <LinearGradient
        colors={[
          Colors.background.gradientTop,
          Colors.background.gradientMiddle ?? '#E0F2FE',
          Colors.background.gradientBottom,
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
