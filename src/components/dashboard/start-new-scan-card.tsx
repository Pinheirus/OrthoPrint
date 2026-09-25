import React from 'react';
import { View } from 'react-native';
import { Plus } from 'phosphor-react-native/src/icons/Plus';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';
import { ListItemCard } from '@/components/ui/list-item-card';
import { IconWrapper } from '@/components/ui/icon-wrapper';

export interface StartNewScanCardProps {
  onPress: () => void;
  className?: string;
  style?: any;
}

/**
 * StartNewScanCard
 * Equal visual weight action card leading the dashboard list.
 * Built directly on top of the generic ListItemCard with NativeWind.
 * Navigates to dedicated camera capture/setup flow on a separate screen.
 */
export function StartNewScanCard({ onPress, className = '', style }: StartNewScanCardProps) {
  return (
    <ListItemCard
      interactive
      accessibilityRole="button"
      accessibilityLabel="Start New Scan"
      accessibilityHint="Navigates to separate 3D limb camera capture workflow"
      onPress={onPress}
      className={`mb-8 ${className}`}
      style={style}
      leadingIcon={
        <View className="w-11 h-11 rounded-full bg-primary-50 border border-primary-100 items-center justify-center">
          <IconWrapper
            icon={Plus}
            size="action"
            color="brand"
            weight="bold"
            accessibilityLabel="New scan icon"
          />
        </View>
      }
      title="Start New Scan"
      subtitle="Capture limb geometry with LiDAR & photogrammetry"
      trailing={
        <IconWrapper
          icon={CaretRight}
          size="status"
          color="muted"
          weight="bold"
          accessibilityLabel="Tap to open camera"
        />
      }
    />
  );
}
