import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'phosphor-react-native/src/icons/Bell';
import { GearSix } from 'phosphor-react-native/src/icons/GearSix';
import { User } from 'phosphor-react-native/src/icons/User';
import { ClinicalText } from '@/components/ui/clinical-text';
import { IconWrapper } from '@/components/ui/icon-wrapper';

export interface TopAppBarProps {
  greeting: string;
  doctorName?: string;
  onAvatarPress?: () => void;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
  hasUnreadNotifications?: boolean;
  className?: string;
}

/**
 * TopAppBar
 * Clean, floating top bar mirroring the modern fintech/clinical reference design.
 * - Calls useSafeAreaInsets() internally — self-sufficient, no prop-drilling required.
 * - Left: Circular avatar immediately followed by friendly greeting ("Hi, Dr. Lucas!").
 * - Right: Two floating minimalist action icons (Bell with unread indicator, Settings).
 * - Floats directly over root gradient without heavy backgrounds or borders.
 */
export function TopAppBar({
  greeting,
  doctorName = 'Dr. Lucas',
  onAvatarPress,
  onNotificationsPress,
  onSettingsPress,
  hasUnreadNotifications = true,
  className = '',
}: TopAppBarProps) {
  // Self-contained safe-area handling: never relies on prop-drilling or SafeAreaView nesting.
  const insets = useSafeAreaInsets();

  // Format greeting to clean, friendly style (e.g. "Hi, Dr. Lucas!")
  const displayGreeting = greeting.startsWith('Hi,')
    ? greeting
    : `Hi, ${doctorName}!`;

  return (
    <View
      className={`flex-row items-center justify-between px-6 pb-5 bg-transparent ${className}`}
      style={{ paddingTop: insets.top + 8 }}
      accessibilityRole="header"
    >
      {/* Left: Avatar immediately followed by greeting */}
      <View className="flex-row items-center flex-1 gap-3">
        <Pressable
          onPress={onAvatarPress ?? onSettingsPress}
          accessibilityRole="button"
          accessibilityLabel={`Profile of ${doctorName}`}
          className="w-10 h-10 rounded-full bg-primary-100 border border-white/90 items-center justify-center active:scale-95 transition-transform"
          style={{
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <IconWrapper
            icon={User}
            size="action"
            color="brand"
            weight="bold"
          />
        </Pressable>

        <ClinicalText
          variant="h2"
          color="primary"
          numberOfLines={1}
          className="text-[19px] font-bold text-slate-900 tracking-tight"
          accessibilityRole="header"
        >
          {displayGreeting}
        </ClinicalText>
      </View>

      {/* Right: Two floating icons with generous spacing, no background pills */}
      <View className="flex-row items-center gap-4">
        {/* Floating Bell Icon with subtle unread badge */}
        <Pressable
          onPress={onNotificationsPress}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          className="p-2 items-center justify-center relative active:opacity-60"
        >
          <IconWrapper
            icon={Bell}
            size="action"
            color="primary"
            weight="regular"
          />
          {hasUnreadNotifications && (
            <View
              className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 border border-white"
              accessibilityLabel="Unread notifications indicator"
            />
          )}
        </Pressable>

        {/* Floating Settings / Controls Icon */}
        <Pressable
          onPress={onSettingsPress}
          accessibilityRole="button"
          accessibilityLabel="Settings and clinic configuration"
          className="p-2 items-center justify-center active:opacity-60"
        >
          <IconWrapper
            icon={GearSix}
            size="action"
            color="primary"
            weight="regular"
          />
        </Pressable>
      </View>
    </View>
  );
}
