import React from 'react';
import { Pressable, View } from 'react-native';
import { IconWrapper } from '@/components/ui/icon-wrapper';
import { Colors } from '@/constants/tokens';

export interface TabItemData {
  key: string;
  icon: any;
  label: string;
}

export interface TabBarItemProps {
  item: TabItemData;
  isActive: boolean;
  onPress: () => void;
  className?: string;
}

/**
 * TabBarItem
 * Individual bottom tab icon button with >= 44x44 touch target,
 * accessible role/state, brand fill icon + active indicator pill when selected.
 */
export function TabBarItem({ item, isActive, onPress, className = '' }: TabBarItemProps) {
  const iconColor = isActive ? Colors.primary[500] : Colors.slate[400];

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: isActive }}
      accessibilityHint={`Navigates to ${item.label}`}
      onPress={onPress}
      className={`min-w-touch min-h-touch items-center justify-center gap-1.5 rounded-xl active:opacity-70 ${className}`}
    >
      <IconWrapper
        icon={item.icon}
        size="nav"
        color={iconColor}
        weight={isActive ? 'fill' : 'regular'}
      />
      {/* Active indicator pill */}
      <View
        className="h-1 rounded-full"
        style={{
          width: isActive ? 20 : 0,
          backgroundColor: isActive ? Colors.primary[500] : 'transparent',
          opacity: isActive ? 1 : 0,
        }}
      />
    </Pressable>
  );
}
