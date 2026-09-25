import React from 'react';
import { View } from 'react-native';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';
import { CheckCircle } from 'phosphor-react-native/src/icons/CheckCircle';
import { SpinnerGap } from 'phosphor-react-native/src/icons/SpinnerGap';
import { WarningCircle } from 'phosphor-react-native/src/icons/WarningCircle';

import { ListItemCard } from '@/components/ui/list-item-card';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { StatusBadge, StatusBadgeType } from '@/components/ui/status-badge';

export type ScanStatus = 'completed' | 'processing' | 'error';

export interface ScanListItemData {
  id: string;
  patientName: string;
  identifier: string; // e.g. procedure/arm code: "SPL-RAD-04 · Right Radius/Ulna"
  status: ScanStatus;
  badgeStatus: StatusBadgeType;
  timestamp: string;
}

export interface ScanListItemProps {
  scan: ScanListItemData;
  onPress: (scan: ScanListItemData) => void;
  className?: string;
  style?: any;
}

const STATUS_ICON_CONFIG: Record<
  ScanStatus,
  {
    icon: any;
    color: 'success' | 'brand' | 'error';
    weight: 'fill' | 'regular' | 'bold';
    a11yLabel: string;
  }
> = {
  completed: {
    icon: CheckCircle,
    color: 'success',
    weight: 'fill',
    a11yLabel: 'Status: Completed',
  },
  processing: {
    icon: SpinnerGap,
    color: 'brand',
    weight: 'bold',
    a11yLabel: 'Status: Processing',
  },
  error: {
    icon: WarningCircle,
    color: 'error',
    weight: 'fill',
    a11yLabel: 'Status: Error',
  },
};

const STATUS_BG_CONFIG: Record<ScanStatus, string> = {
  completed: 'bg-emerald-50 border border-emerald-100',
  processing: 'bg-sky-50 border border-sky-100',
  error: 'bg-rose-50 border border-rose-100',
};

/**
 * ScanListItem
 * Individual horizontal card for recent scans.
 * Extends the generic ListItemCard with specific clinical status icon,
 * StatusBadge pill, and navigation chevron via NativeWind.
 */
export function ScanListItem({ scan, onPress, className = '', style }: ScanListItemProps) {
  const iconConfig = STATUS_ICON_CONFIG[scan.status];
  const bgClass = STATUS_BG_CONFIG[scan.status];

  return (
    <ListItemCard
      interactive
      accessibilityRole="button"
      accessibilityLabel={`Patient: ${scan.patientName}, ${scan.identifier}. Status: ${scan.badgeStatus}.`}
      accessibilityHint="Navigates to 3D Viewer and splint parameters screen"
      onPress={() => onPress(scan)}
      className={className}
      style={style}
      leadingIcon={
        <View className={`w-11 h-11 rounded-full items-center justify-center ${bgClass}`}>
          <IconWrapper
            icon={iconConfig.icon}
            size="action"
            color={iconConfig.color}
            weight={iconConfig.weight}
            accessibilityLabel={iconConfig.a11yLabel}
          />
        </View>
      }
      title={scan.patientName}
      subtitle={scan.identifier}
      trailing={
        <>
          <StatusBadge status={scan.badgeStatus} />
          <View className="w-4 items-center justify-center">
            <IconWrapper
              icon={CaretRight}
              size="status"
              color="muted"
              weight="bold"
              accessibilityLabel="Open 3D model"
            />
          </View>
        </>
      }
    />
  );
}
