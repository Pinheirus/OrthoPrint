import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { ClinicalText } from '@/components/ui/clinical-text';
import { IconWrapper, IconColorRole } from '@/components/ui/icon-wrapper';

export interface MetricCardProps {
  label: string;
  value: number | string;
  icon: any;
  iconColor?: IconColorRole | string;
  iconWeight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  accessibilityLabel?: string;
  className?: string;
  style?: any;
}

/**
 * MetricCard
 * Secondary status glance card rendered within the metrics row.
 * Uses GlassCard and NativeWind utility classes with IBM Plex Mono values.
 */
export function MetricCard({
  label,
  value,
  icon,
  iconColor = 'muted',
  iconWeight = 'regular',
  accessibilityLabel,
  className = '',
  style,
}: MetricCardProps) {
  const displayValue =
    typeof value === 'number' ? value.toString().padStart(2, '0') : value;

  return (
    <GlassCard
      density="standard"
      elevation="soft"
      minTouchTarget={false}
      radius="3xl"
      className={`flex-1 py-4 px-4 ${className}`}
      style={[{ minHeight: 88 }, style]}
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <ClinicalText
          variant="tiny"
          color="secondary"
          numberOfLines={1}
          className="shrink text-[11px] font-medium uppercase tracking-wide"
        >
          {label}
        </ClinicalText>
        <IconWrapper
          icon={icon}
          size="inline"
          color={iconColor}
          weight={iconWeight}
          accessibilityLabel={`${label} icon`}
        />
      </View>
      <ClinicalText
        variant="h2"
        color="primary"
        mono
        style={{ fontSize: 24, lineHeight: 32, fontWeight: '700' }}
      >
        {displayValue}
      </ClinicalText>
    </GlassCard>
  );
}
