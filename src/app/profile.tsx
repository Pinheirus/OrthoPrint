import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'phosphor-react-native/src/icons/ArrowLeft';
import { Stethoscope } from 'phosphor-react-native/src/icons/Stethoscope';
import { Certificate } from 'phosphor-react-native/src/icons/Certificate';
import { Crosshair } from 'phosphor-react-native/src/icons/Crosshair';
import { Vibrate } from 'phosphor-react-native/src/icons/Vibrate';
import { SignOut } from 'phosphor-react-native/src/icons/SignOut';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';
import { User } from 'phosphor-react-native/src/icons/User';
import { GearSix } from 'phosphor-react-native/src/icons/GearSix';
import { ClinicalText } from '@/components/ui/clinical-text';
import { GlassTabBar } from '@/components/navigation/glass-tab-bar';

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

  const isWeb = Platform.OS === 'web';
  const GLASS_CARD_STYLE = {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderRadius: 20,
    overflow: 'hidden' as const,
  };

  return (
    <View className="flex-1">
      {/* 1. Dynamic Background: white at top fading to soft clinical blue at bottom */}
      <LinearGradient
        colors={['#FFFFFF', '#F0F8FF', '#D6EAF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Clinical Header with safe-area spacing and clean blue gear icon */}
      <View
        style={{ paddingTop: insets.top + 16 }}
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

        {/* Clean Blue Gear Icon (No wrapper background/border) */}
        <Pressable
          hitSlop={8}
          className="w-10 h-10 items-center justify-center active:opacity-70"
        >
          <GearSix size={22} color="#0284C7" weight="bold" />
        </Pressable>
      </View>

      {/* Main ScrollView with paddingBottom: 180 to guarantee floating tab bar clearance */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 180,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card: Avatar & Doctor Profile Details */}
        <BlurView
          intensity={50}
          tint="light"
          style={[
            GLASS_CARD_STYLE,
            {
              alignItems: 'center',
              padding: 24,
              marginBottom: 24,
            },
            isWeb && ({
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            } as any),
          ]}
        >
          {/* Centered Avatar with Anchored Green Status Indicator */}
          <View style={{ position: 'relative', width: 96, height: 96, marginBottom: 14 }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: '#E0F2FE',
                borderWidth: 2,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#0EA5E9',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <User size={46} color="#0EA5E9" weight="duotone" />
            </View>
            {/* Active Status Dot anchored directly to avatar circle */}
            <View
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#10B981',
                borderWidth: 2,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' }} />
            </View>
          </View>

          <ClinicalText variant="h2" color="primary" align="center">
            Dr. Lucas Pinheiro
          </ClinicalText>
          <ClinicalText variant="caption" color="secondary" align="center" className="mt-0.5">
            Universidad Sudamericana
          </ClinicalText>

          {/* Centered Neat Pill Badge */}
          <View
            style={{
              alignSelf: 'center',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              marginTop: 12,
              backgroundColor: 'rgba(0, 122, 255, 0.1)',
            }}
          >
            <ClinicalText variant="tiny" color="brand" className="font-semibold uppercase tracking-wider">
              Lead Orthopedic Surgeon
            </ClinicalText>
          </View>
        </BlurView>

        {/* Section 1: Professional Details */}
        <View className="mb-6">
          <ClinicalText variant="h3" color="primary" className="mb-2.5 ml-1">
            Professional Details
          </ClinicalText>

          <BlurView
            intensity={50}
            tint="light"
            style={[
              GLASS_CARD_STYLE,
              isWeb && ({
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              } as any),
            ]}
          >
            {/* Specialty Row */}
            <View className="p-4 flex-row items-center justify-between border-b border-white/60">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-sky-50/80 border border-sky-100 items-center justify-center">
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
                <View className="w-9 h-9 rounded-xl bg-sky-50/80 border border-sky-100 items-center justify-center">
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
          </BlurView>
        </View>

        {/* Section 2: Hardware Settings */}
        <View className="mb-6">
          <ClinicalText variant="h3" color="primary" className="mb-2.5 ml-1">
            Hardware & Scanner
          </ClinicalText>

          <BlurView
            intensity={50}
            tint="light"
            style={[
              GLASS_CARD_STYLE,
              isWeb && ({
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              } as any),
            ]}
          >
            {/* LiDAR Calibration Row */}
            <Pressable
              onPress={handleLidarCalibration}
              className="p-4 flex-row items-center justify-between border-b border-white/60 active:bg-white/30"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-xl bg-sky-50/80 border border-sky-100 items-center justify-center">
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
                <View className="w-9 h-9 rounded-xl bg-sky-50/80 border border-sky-100 items-center justify-center">
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
          </BlurView>
        </View>

        {/* Section 3: Account / Session */}
        <View className="mb-2">
          <ClinicalText variant="h3" color="primary" className="mb-2.5 ml-1">
            Account
          </ClinicalText>

          <BlurView
            intensity={50}
            tint="light"
            style={[
              GLASS_CARD_STYLE,
              isWeb && ({
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              } as any),
            ]}
          >
            <Pressable
              onPress={handleLogout}
              className="p-4 flex-row items-center justify-between active:bg-rose-50/40"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-200/50 items-center justify-center">
                  <SignOut size={20} color="#F43F5E" weight="bold" />
                </View>
                <ClinicalText variant="bodyMedium" color="error" className="font-semibold">
                  End Clinical Session (Log Out)
                </ClinicalText>
              </View>
              <CaretRight size={18} color="#FDA4AF" />
            </Pressable>
          </BlurView>
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
