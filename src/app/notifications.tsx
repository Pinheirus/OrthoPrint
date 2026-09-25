import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'phosphor-react-native/src/icons/ArrowLeft';
import { Bell } from 'phosphor-react-native/src/icons/Bell';
import { CheckCircle } from 'phosphor-react-native/src/icons/CheckCircle';
import { Printer } from 'phosphor-react-native/src/icons/Printer';
import { GlassCard } from '@/components/ui/glass-card';
import { ClinicalText } from '@/components/ui/clinical-text';
import { Colors } from '@/constants/tokens';

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: '3D Print Complete',
    body: 'Right Radius/Ulna splint for Eleanor Vance has finished printing and passed automated dimensional check.',
    timestamp: '5m ago',
    type: 'success',
  },
  {
    id: 'notif-2',
    title: 'Mesh Generation Succeeded',
    body: 'Point cloud data for Marcus Holloway was successfully processed into a manifold STL mesh.',
    timestamp: '25m ago',
    type: 'info',
  },
  {
    id: 'notif-3',
    title: 'LiDAR Sensor Calibrated',
    body: 'Diagnostic routine completed with 0.1mm volumetric accuracy.',
    timestamp: '2h ago',
    type: 'system',
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-sky-50">
      {/* Background Linear Gradient */}
      <LinearGradient
        colors={[
          Colors.background.gradientTop,
          Colors.background.gradientMiddle ?? '#E0F2FE',
          Colors.background.gradientBottom,
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="absolute inset-0"
      />

      {/* Top Clinical Header */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-5 pb-3 flex-row items-center gap-3 bg-transparent z-10"
      >
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-white/80 border border-white/90 items-center justify-center shadow-sm active:opacity-75"
        >
          <ArrowLeft size={20} color="#0F172A" weight="bold" />
        </Pressable>

        <View className="flex-1 justify-center">
          <ClinicalText variant="caption" color="brand" className="uppercase tracking-widest font-semibold">
            System Alerts
          </ClinicalText>
          <ClinicalText variant="h2" color="primary" numberOfLines={1}>
            Notifications
          </ClinicalText>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_NOTIFICATIONS.length > 0 ? (
          <View className="gap-3.5">
            {MOCK_NOTIFICATIONS.map((item) => (
              <GlassCard
                key={item.id}
                density="standard"
                elevation="soft"
                radius="2xl"
                className="p-4"
              >
                <View className="flex-row items-start gap-3.5">
                  <View className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 items-center justify-center mt-0.5">
                    {item.type === 'success' ? (
                      <Printer size={20} color="#0EA5E9" weight="duotone" />
                    ) : (
                      <CheckCircle size={20} color="#0EA5E9" weight="duotone" />
                    )}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
                        {item.title}
                      </ClinicalText>
                      <ClinicalText variant="tiny" color="muted">
                        {item.timestamp}
                      </ClinicalText>
                    </View>
                    <ClinicalText variant="caption" color="secondary" className="leading-relaxed">
                      {item.body}
                    </ClinicalText>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20 px-6">
            <View className="w-16 h-16 rounded-3xl bg-sky-50 items-center justify-center mb-4">
              <Bell size={28} color="#94A3B8" />
            </View>
            <ClinicalText variant="bodyMedium" color="primary" className="font-semibold text-center">
              No new notifications
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary" align="center" className="mt-1">
              Automated 3D printing and clinical alerts will appear here.
            </ClinicalText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
