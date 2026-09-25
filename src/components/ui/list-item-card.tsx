import React from 'react';
import { View } from 'react-native';
import { GlassCard, GlassCardProps } from './glass-card';
import { ClinicalText } from './clinical-text';

export interface ListItemCardProps extends Omit<GlassCardProps, 'children'> {
  /**
   * Left icon, icon wrapper, or icon badge element
   */
  leadingIcon: React.ReactNode;
  /**
   * Primary title text (e.g. Patient name, Action label)
   */
  title: string;
  /**
   * Secondary subtitle / identifier text
   */
  subtitle?: string;
  /**
   * Trailing slot (e.g. StatusBadge + Chevron, or Chevron alone)
   */
  trailing?: React.ReactNode;
  /**
   * NativeWind className
   */
  className?: string;
}

/**
 * ListItemCard
 * Reusable Design System list-row primitive built directly on GlassCard with NativeWind.
 * Enforces consistent rhythm: icon on the left, title + subtitle in the middle,
 * and trailing status/action element on the right.
 */
export function ListItemCard({
  leadingIcon,
  title,
  subtitle,
  trailing,
  className = '',
  style,
  interactive = true,
  onPress,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  ...restProps
}: ListItemCardProps) {
  return (
    <GlassCard
      interactive={interactive}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}, ${subtitle}` : title)}
      accessibilityHint={accessibilityHint}
      className={`p-5 ${className}`}
      style={style}
      {...restProps}
    >
      <View className="flex-row items-center">
        {/* Left: Leading icon slot */}
        <View className="w-11 h-11 items-center justify-center mr-4">{leadingIcon}</View>

        {/* Center: Title + Subtitle */}
        <View className="flex-1 justify-center">
          <ClinicalText variant="h3" color="primary" numberOfLines={1}>
            {title}
          </ClinicalText>
          {subtitle ? (
            <ClinicalText
              variant="caption"
              color="secondary"
              numberOfLines={1}
              className="mt-0.5"
            >
              {subtitle}
            </ClinicalText>
          ) : null}
        </View>

        {/* Right: Trailing slot */}
        {trailing ? <View className="flex-row items-center ml-2.5 gap-2">{trailing}</View> : null}
      </View>
    </GlassCard>
  );
}
