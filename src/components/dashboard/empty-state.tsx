import React from 'react';
import { View } from 'react-native';
import { FolderSimpleDashed } from 'phosphor-react-native/src/icons/FolderSimpleDashed';
import { ClinicalText } from '@/components/ui/clinical-text';
import { IconWrapper } from '@/components/ui/icon-wrapper';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
  style?: any;
}

/**
 * EmptyState
 * Illustrative clinical fallback shown when the recent scan history is empty.
 * Replaces the recent-scans list while keeping StartNewScanCard intact, styled with NativeWind.
 */
export function EmptyState({
  title = 'No scans yet',
  description = 'Tap Start New Scan above to initiate a patient limb capture session.',
  className = '',
  style,
}: EmptyStateProps) {
  return (
    <View
      className={`py-12 px-6 items-center justify-center ${className}`}
      style={style}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${description}`}
    >
      <View className="w-[72px] h-[72px] rounded-full bg-white/70 border border-slate-200 items-center justify-center mb-4">
        <IconWrapper
          icon={FolderSimpleDashed}
          size="hero"
          color="muted"
          weight="light"
          accessibilityLabel="No scans icon"
        />
      </View>

      <ClinicalText
        variant="h2"
        color="secondary"
        align="center"
        className="mb-1.5"
      >
        {title}
      </ClinicalText>

      <ClinicalText
        variant="body"
        color="secondary"
        align="center"
        className="max-w-[280px] leading-5"
      >
        {description}
      </ClinicalText>
    </View>
  );
}
