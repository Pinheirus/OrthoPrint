import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House } from 'phosphor-react-native/src/icons/House';
import { Cube } from 'phosphor-react-native/src/icons/Cube';
import { PlusCircle } from 'phosphor-react-native/src/icons/PlusCircle';
import { User } from 'phosphor-react-native/src/icons/User';
import { GlassSurface } from '@/components/primitives/glass-surface';
import { IconWrapper } from '@/components/primitives/icon-wrapper';
import { Colors } from '@/constants/tokens';

export type TabKey = 'dashboard' | 'scans' | 'new-scan' | 'profile';

export interface GlassTabBarProps {
  activeTab: TabKey;
  onTabPress?: (tab: TabKey) => void;
  className?: string;
}

interface TabItem {
  key: TabKey;
  icon: any;
  label: string;
}

const TABS: TabItem[] = [
  { key: 'dashboard', icon: House, label: 'Dashboard' },
  { key: 'scans', icon: Cube, label: 'Scans & Splints' },
  { key: 'new-scan', icon: PlusCircle, label: 'New Scan' },
  { key: 'profile', icon: User, label: 'Doctor Profile' },
];

/**
 * GlassTabBar
 * Persistent, full-width glass bottom tab bar with 4 equal-weight icon-only tabs.
 * Entire bar has glass blur and near-opaque medical wash.
 * Migrated to NativeWind className classes.
 */
export function GlassTabBar({ activeTab, onTabPress, className = '' }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <View className={`absolute left-0 right-0 bottom-0 z-50 ${className}`} pointerEvents="box-none">
      <GlassSurface
        density="dense"
        intensity={30}
        radius="none"
        elevation="lg"
        className="border-t border-glass-border pt-2.5 bg-glass-surface-dense"
        style={{ paddingBottom: bottomPadding }}
      >
        <View className="flex-row justify-around items-center px-4" accessibilityRole="tablist">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const iconColor = isActive ? Colors.primary[500] : Colors.slate[400];

            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
                accessibilityHint={`Navigates to ${tab.label}`}
                onPress={() => onTabPress?.(tab.key)}
                className="min-w-touch min-h-touch items-center justify-center rounded-xl active:opacity-70"
              >
                <IconWrapper
                  icon={tab.icon}
                  size="nav"
                  color={iconColor}
                  weight={isActive ? 'fill' : 'regular'}
                />
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}
