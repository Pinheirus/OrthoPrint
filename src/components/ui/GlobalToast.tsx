import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BellRinging } from 'phosphor-react-native/src/icons/BellRinging';
import { X } from 'phosphor-react-native/src/icons/X';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ClinicalText } from '@/components/ui/clinical-text';
import { useNotificationStore } from '@/store/useNotificationStore';

/**
 * GlobalToast
 * Pure JS-based in-app notification banner that floats across all screens.
 * Uses GlassSurface for clinical glassmorphism and automatically dismisses.
 */
export function GlobalToast() {
  const insets = useSafeAreaInsets();
  const { isVisible, title, message, hideNotification } = useNotificationStore();

  if (!isVisible) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 16,
        right: 16,
        zIndex: 9999,
        elevation: 9999,
      }}
      pointerEvents="box-none"
    >
      <GlassSurface
        density="dense"
        elevation="lg"
        radius="3xl"
        className="p-4 border border-sky-300/80 bg-white/95"
      >
        <View className="flex-row items-start gap-3.5">
          <View className="w-10 h-10 rounded-2xl bg-sky-500 items-center justify-center shadow-md shadow-sky-500/30">
            <BellRinging size={20} color="#FFFFFF" weight="fill" />
          </View>

          <View className="flex-1 pr-1">
            <ClinicalText variant="bodyMedium" color="primary" className="font-bold">
              {title}
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary" className="mt-0.5 leading-snug">
              {message}
            </ClinicalText>
          </View>

          <Pressable
            onPress={hideNotification}
            hitSlop={8}
            className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
          >
            <X size={14} color="#64748B" weight="bold" />
          </Pressable>
        </View>
      </GlassSurface>
    </View>
  );
}
export default GlobalToast;
