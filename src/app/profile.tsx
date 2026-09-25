import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'phosphor-react-native/src/icons/ArrowLeft';
import { Stethoscope } from 'phosphor-react-native/src/icons/Stethoscope';
import { Certificate } from 'phosphor-react-native/src/icons/Certificate';
import { Crosshair } from 'phosphor-react-native/src/icons/Crosshair';
import { Vibrate } from 'phosphor-react-native/src/icons/Vibrate';
import { SignOut } from 'phosphor-react-native/src/icons/SignOut';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';
import { User } from 'phosphor-react-native/src/icons/User';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ClinicalText } from '@/components/ui/clinical-text';
import { GlassTabBar } from '@/components/navigation/glass-tab-bar';
import { Colors } from '@/constants/tokens';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  };

  const handleLidarCalibration = () => {
    Haptics.selectionAsync();
    Alert.alert(
      'LiDAR Calibration',
      'LiDAR depth sensors are calibrated to 0.1mm tolerance. Ready for orthopedic capture.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Log Out', 'Are you sure you want to end your clinical session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => router.replace('/'),
      },
    ]);
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
            Clinician Settings
          </ClinicalText>
          <ClinicalText variant="h2" color="primary" numberOfLines={1}>
            Doctor Profile
          </ClinicalText>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: insets.bottom + 120, // Leave room for floating bottom tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card: Avatar & Doctor Profile Details */}
        <GlassSurface density="dense" elevation="md" radius="4xl" className="p-6 items-center mb-5">
          {/* Large Circular Avatar Placeholder */}
          <View className="relative mb-3.5">
            <View className="w-24 h-24 rounded-full bg-primary-100 border-2 border-white items-center justify-center shadow-md shadow-primary-500/20">
              <User size={46} color="#0EA5E9" weight="duotone" />
            </View>
            {/* Active Clinical Status Indicator */}
            <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white items-center justify-center">
              <View className="w-2 h-2 rounded-full bg-white" />
            </View>
          </View>

          <ClinicalText variant="h2" color="primary" align="center">
            Dr. Lucas Pinheiro
          </ClinicalText>
          <ClinicalText variant="caption" color="secondary" align="center" className="mt-0.5">
            Universidad Sudamericana
          </ClinicalText>

          <View className="mt-3 bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full">
            <ClinicalText variant="tiny" color="brand" className="font-semibold uppercase tracking-wider">
              Lead Orthopedic Surgeon
            </ClinicalText>
          </View>
        </GlassSurface>

        {/* Section 1: Professional Details */}
        <View className="mb-5">
          <ClinicalText variant="h3" color="primary" className="mb-2.5 ml-1">
            Professional Details
          </ClinicalText>

          <GlassSurface density="standard" radius="2xl" className="overflow-hidden">
            {/* Specialty Row */}
            <View className="p-4 flex-row items-center justify-between border-b border-slate-100">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-sky-50 items-center justify-center">
                  <Stethoscope size={20} color="#0EA5E9" weight="duotone" />
                </View>
                <View>
                  <ClinicalText variant="caption" color="secondary">
                    Specialty
                  </ClinicalText>
                  <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
                    Orthopedics & Traumatology
                  </ClinicalText>
                </View>
              </View>
            </View>

            {/* License / CRM Row */}
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-sky-50 items-center justify-center">
                  <Certificate size={20} color="#0EA5E9" weight="duotone" />
                </View>
                <View>
                  <ClinicalText variant="caption" color="secondary">
                    Medical License (CRM)
                  </ClinicalText>
                  <ClinicalText variant="bodyMedium" color="primary" mono className="font-semibold">
                    CRM-PY 94821
                  </ClinicalText>
                </View>
              </View>
            </View>
          </GlassSurface>
        </View>

        {/* Section 2: Hardware Settings */}
        <View className="mb-5">
          <ClinicalText variant="h3" color="primary" className="mb-2.5 ml-1">
            Hardware & Scanner
          </ClinicalText>

          <GlassSurface density="standard" radius="2xl" className="overflow-hidden">
            {/* LiDAR Calibration Row */}
            <Pressable
              onPress={handleLidarCalibration}
              className="p-4 flex-row items-center justify-between border-b border-slate-100 active:bg-slate-50"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-xl bg-sky-50 items-center justify-center">
                  <Crosshair size={20} color="#0EA5E9" weight="duotone" />
                </View>
                <View className="flex-1">
                  <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
                    LiDAR Calibration
                  </ClinicalText>
                  <ClinicalText variant="caption" color="secondary">
                    Recalibrate spatial point-cloud sensor
                  </ClinicalText>
                </View>
              </View>
              <CaretRight size={18} color="#94A3B8" />
            </Pressable>

            {/* Haptic Feedback Toggle Row */}
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1 pr-3">
                <View className="w-9 h-9 rounded-xl bg-sky-50 items-center justify-center">
                  <Vibrate size={20} color="#0EA5E9" weight="duotone" />
                </View>
                <View className="flex-1">
                  <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
                    Haptic Feedback
                  </ClinicalText>
                  <ClinicalText variant="caption" color="secondary">
                    Tactile alerts on capture & printing
                  </ClinicalText>
                </View>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setHapticsEnabled(val);
                }}
                trackColor={{ false: '#CBD5E1', true: '#0EA5E9' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </GlassSurface>
        </View>

        {/* Section 3: Account / Session */}
        <View className="mb-2">
          <ClinicalText variant="h3" color="primary" className="mb-2.5 ml-1">
            Account
          </ClinicalText>

          <GlassSurface density="standard" radius="2xl" className="overflow-hidden">
            <Pressable
              onPress={handleLogout}
              className="p-4 flex-row items-center justify-between active:bg-rose-50/50"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-rose-50 items-center justify-center">
                  <SignOut size={20} color="#F43F5E" weight="bold" />
                </View>
                <ClinicalText variant="bodyMedium" color="error" className="font-semibold">
                  End Clinical Session (Log Out)
                </ClinicalText>
              </View>
              <CaretRight size={18} color="#FDA4AF" />
            </Pressable>
          </GlassSurface>
        </View>
      </ScrollView>

      {/* Floating Bottom Tab Bar for Global Navigation */}
      <GlassTabBar
        activeTab="profile"
        onTabPress={(tab) => {
          if (tab === 'dashboard') {
            router.replace('/');
          } else if (tab === 'new-scan') {
            router.push('/new-scan');
          }
        }}
      />
    </View>
  );
}
