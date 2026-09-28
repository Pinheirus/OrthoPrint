import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';
import { Check } from 'phosphor-react-native/src/icons/Check';
import { SpinnerGap } from 'phosphor-react-native/src/icons/SpinnerGap';
import { WarningCircle } from 'phosphor-react-native/src/icons/WarningCircle';

import { ClinicalText } from '@/components/ui/clinical-text';
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

const isWeb = Platform.OS === 'web';
const GLASS_CARD_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
  borderColor: 'rgba(255, 255, 255, 0.9)',
  borderWidth: 1.5,
  borderRadius: 20,
  overflow: 'hidden' as const,
};

const STATUS_ICON_CONFIG: Record<
  ScanStatus,
  {
    icon: any;
    colorHex: string;
    borderClass: string;
    a11yLabel: string;
  }
> = {
  completed: {
    icon: Check,
    colorHex: '#10B981',
    borderClass: 'border-emerald-500',
    a11yLabel: 'Status: Completed',
  },
  processing: {
    icon: SpinnerGap,
    colorHex: '#F59E0B',
    borderClass: 'border-amber-500',
    a11yLabel: 'Status: Processing',
  },
  error: {
    icon: WarningCircle,
    colorHex: '#EF4444',
    borderClass: 'border-rose-500',
    a11yLabel: 'Status: Error',
  },
};

/**
 * ScanListItem
 * Individual horizontal card for recent scans.
 * Enforces robust flexbox structure preventing badge and chevron squishing:
 * - Left Group: flex: 1 with paddingRight: 12 so text truncates cleanly.
 * - Right Group: Badge with marginRight: 12 + Chevron.
 */
export function ScanListItem({ scan, onPress, className = '', style }: ScanListItemProps) {
  const iconConfig = STATUS_ICON_CONFIG[scan.status];
  const IconComponent = iconConfig.icon;

  return (
    <Pressable
      onPress={() => onPress(scan)}
      accessibilityRole="button"
      accessibilityLabel={`Patient: ${scan.patientName}, ${scan.identifier}. Status: ${scan.badgeStatus}.`}
      accessibilityHint="Navigates to 3D Viewer and splint parameters screen"
      className={`active:opacity-80 ${className}`}
      style={style}
    >
      <BlurView
        intensity={50}
        tint="light"
        style={[
          GLASS_CARD_STYLE,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
          },
          isWeb && ({
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          } as any),
        ]}
      >
        {/* Left Group (Icon + Text) */}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 12 }}>
          <View
            className={`w-11 h-11 rounded-full bg-transparent border items-center justify-center mr-3.5 ${iconConfig.borderClass}`}
          >
            <IconComponent
              size={20}
              color={iconConfig.colorHex}
              weight="bold"
            />
          </View>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ClinicalText variant="h3" color="primary" numberOfLines={1}>
              {scan.patientName}
            </ClinicalText>
            <ClinicalText
              variant="caption"
              color="secondary"
              numberOfLines={1}
              className="mt-0.5"
            >
              {scan.identifier}
            </ClinicalText>
          </View>
        </View>

        {/* Right Group (Badge + Chevron) */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginRight: 12 }}>
            <StatusBadge status={scan.badgeStatus} />
          </View>
          <CaretRight size={16} color="#94A3B8" weight="bold" />
        </View>
      </BlurView>
    </Pressable>
  );
}
export default ScanListItem;
