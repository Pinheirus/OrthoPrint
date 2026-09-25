import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { House } from 'phosphor-react-native/src/icons/House';
import { PlusCircle } from 'phosphor-react-native/src/icons/PlusCircle';
import { User } from 'phosphor-react-native/src/icons/User';
import { TabBarItem, TabItemData } from './tab-bar-item';

export type TabKey = 'dashboard' | 'new-scan' | 'profile';

export interface GlassTabBarProps {
  activeTab: TabKey;
  onTabPress?: (tab: TabKey) => void;
  className?: string;
}

const TABS: (TabItemData & { key: TabKey })[] = [
  { key: 'dashboard', icon: House, label: 'Home' },
  { key: 'new-scan', icon: PlusCircle, label: 'New Scan' },
  { key: 'profile', icon: User, label: 'Profile' },
];

/**
 * GlassTabBar
 * Floating "pill" style bottom navigation bar with 3 clean destinations:
 * - Home (/)
 * - New Scan (/new-scan)
 * - Profile (/profile)
 * Distributes items evenly across the frosted glass pill.
 */
export function GlassTabBar({ activeTab, onTabPress, className = '' }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  // Sit 16px above the home indicator / bottom edge
  const bottomPosition = Math.max(insets.bottom, 16) + 16;
  const isWeb = Platform.OS === 'web';

  return (
    <View
      className={`absolute left-5 right-5 z-50 ${className}`}
      style={{ bottom: bottomPosition }}
      pointerEvents="box-none"
    >
      <View
        className="relative rounded-full"
        style={[
          {
            shadowColor: '#0C4A6E',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.14,
            shadowRadius: 24,
            elevation: 12,
          },
          isWeb && ({
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          } as any),
        ]}
      >
        {/* Base Layer: max-intensity Expo BlurView for strong frosted effect */}
        {!isWeb && (
          <BlurView
            intensity={100}
            tint="light"
            className="absolute inset-0 rounded-full overflow-hidden"
          />
        )}

        {/* Semi-transparent white glass fill */}
        <View
          pointerEvents="none"
          className="absolute inset-0 rounded-full bg-white/40 overflow-hidden"
        />

        {/* Crisp outer border */}
        <View
          pointerEvents="none"
          className="absolute inset-0 rounded-full border border-white/60"
        />

        {/* Top specular highlight — simulates light catching the top edge of a glass surface */}
        <View
          pointerEvents="none"
          className="absolute top-0 left-6 right-6 h-px bg-white/80 rounded-full"
        />

        {/* Navigation Tab Icons Row - 3 evenly distributed tabs */}
        <View
          className="flex-row justify-around items-center px-4 py-2.5 z-10"
          accessibilityRole="tablist"
        >
          {TABS.map((tab) => (
            <TabBarItem
              key={tab.key}
              item={tab}
              isActive={activeTab === tab.key}
              onPress={() => onTabPress?.(tab.key)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
