import React from 'react';
import { View } from 'react-native';
import { ClinicalText } from './clinical-text';

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
    pillClasses: string;
    textColor: 'warning' | 'info' | 'success' | 'error';
    a11yText: string;
  }
> = {
  processing: {
    label: 'Processing',
    pillClasses: 'bg-clinical-warning-bg border-clinical-warning-border',
    textColor: 'warning',
    a11yText: 'Status badge: Processing 3D mesh model',
  },
  ready: {
    label: 'Ready',
    pillClasses: 'bg-clinical-info-bg border-clinical-info-border',
    textColor: 'info',
    a11yText: 'Status badge: Ready for 3D slicing & printing',
  },
  printed: {
    label: 'Printed',
    pillClasses: 'bg-clinical-success-bg border-clinical-success-border',
    textColor: 'success',
    a11yText: 'Status badge: Splint fabrication complete, Printed',
  },
  error: {
    label: 'Error',
    pillClasses: 'bg-clinical-error-bg border-clinical-error-border',
    textColor: 'error',
    a11yText: 'Status badge: Error occurred during processing',
  },
};

/**
 * StatusBadge
 * Design System primitive for rendering desaturated clinical state pills using NativeWind tokens.
 * Resolves colors, borders, and accessible text purely from the `status` prop.
 */
export function StatusBadge({ status, className = '', style }: StatusBadgeProps) {
  const config = BADGE_CONFIG[status] ?? BADGE_CONFIG.processing;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={config.a11yText}
      className={`px-2 py-0.5 rounded-full border items-center justify-center ${config.pillClasses} ${className}`}
      style={style}
    >
      <ClinicalText
        variant="tiny"
        color={config.textColor}
        className="text-[11px] leading-[14px] font-semibold"
      >
        {config.label}
      </ClinicalText>
    </View>
  );
}
