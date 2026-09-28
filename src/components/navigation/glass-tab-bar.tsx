import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
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
 * High-end Dribbble-inspired floating glass pill bottom navigation bar with elegant drop shadow.
 */
export function GlassTabBar({ activeTab, onTabPress, className = '' }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPosition = Math.max(insets.bottom, 12) + 12;
  const isWeb = Platform.OS === 'web';

  return (
    <View
      className={`absolute left-0 right-0 z-50 ${className}`}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
      }}
      pointerEvents="box-none"
    >
      {/* Container holding the Bottom Navigation BlurView with drop shadow */}
      <View
        style={{
          position: 'absolute',
          bottom: bottomPosition,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 40,
          shadowColor: '#003366',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 10,
        }}
      >
        <BlurView
          intensity={85}
          tint="light"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 40,
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              borderWidth: 1.5,
              borderColor: 'rgba(255, 255, 255, 1)',
            },
            isWeb && ({
              backdropFilter: 'blur(35px)',
              WebkitBackdropFilter: 'blur(35px)',
            } as any),
          ]}
        >
          {/* Navigation Tab Icons Row - perfectly centered vertically and horizontally */}
          <View
            className="flex-row justify-around items-center h-full px-4"
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
        </BlurView>
      </View>
    </View>
  );
}
