import React from 'react';
import { Text, View } from 'react-native';

export type StatusBadgeType = 'processing' | 'ready' | 'printed' | 'error';

export interface StatusBadgeProps {
  status: StatusBadgeType;
  className?: string;
  style?: any;
}

const BADGE_CONFIG: Record<
  StatusBadgeType,
  {
    label: string;
    borderClass: string;
    textColor: string;
    a11yText: string;
  }
> = {
  processing: {
    label: 'Processing',
    borderClass: 'border-amber-500',
    textColor: '#F59E0B',
    a11yText: 'Status badge: Processing 3D mesh model',
  },
  ready: {
    label: 'Ready',
    borderClass: 'border-sky-500',
    textColor: '#0EA5E9',
    a11yText: 'Status badge: Ready for 3D slicing & printing',
  },
  printed: {
    label: 'Printed',
    borderClass: 'border-emerald-500',
    textColor: '#10B981',
    a11yText: 'Status badge: Splint fabrication complete, Printed',
  },
  error: {
    label: 'Error',
    borderClass: 'border-rose-500',
    textColor: '#EF4444',
    a11yText: 'Status badge: Error occurred during processing',
  },
};

/**
 * StatusBadge
 * Design System primitive for rendering clinical state pills.
 * Transparent background with colored border and text matching status.
 */
export function StatusBadge({ status, className = '', style }: StatusBadgeProps) {
  const config = BADGE_CONFIG[status] ?? BADGE_CONFIG.processing;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={config.a11yText}
      className={`px-2.5 py-0.5 rounded-full bg-transparent border ${config.borderClass} items-center justify-center ${className}`}
      style={style}
    >
      <Text
        style={{ color: config.textColor }}
        className="text-[11px] leading-[15px] font-semibold"
      >
        {config.label}
      </Text>
    </View>
  );
}
