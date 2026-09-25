import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'phosphor-react-native/src/icons/ArrowLeft';
import { User } from 'phosphor-react-native/src/icons/User';
import { Bone } from 'phosphor-react-native/src/icons/Bone';
import { CheckCircle } from 'phosphor-react-native/src/icons/CheckCircle';
import { Eye } from 'phosphor-react-native/src/icons/Eye';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ClinicalText } from '@/components/ui/clinical-text';
import { Colors } from '@/constants/tokens';

export default function ScanDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    patientName?: string;
    region?: string;
    side?: string;
    status?: string;
    date?: string;
    thickness?: string;
    density?: string;
  }>();

  const patientName = params.patientName?.trim() || 'Eleanor Vance';
  const region = params.region || 'Radius/Ulna';
  const side = params.side || 'Right';
  const status = (params.status || 'completed').toLowerCase();
  const date = params.date || 'Today';
  const id = params.id || 'SPL-RAD-04';

  const isProcessing = status === 'processing';
  const isReadyOrPrinted = status === 'completed' || status === 'ready' || status === 'printed';

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  };

  const handleOpenViewer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/viewer',
      params: {
        id,
        patientName,
        region,
        side,
        thickness: params.thickness || '2.4',
        density: params.density || 'Standard',
        isReadOnly: 'true',
      },
    });
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
            Clinical Documentation
          </ClinicalText>
          <ClinicalText variant="h2" color="primary" numberOfLines={1}>
            Scan Record
          </ClinicalText>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: insets.bottom + 104,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Patient Information */}
        <GlassCard density="standard" elevation="soft" radius="3xl" className="p-5 mb-4">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-2xl bg-primary-100 border border-white/90 items-center justify-center shadow-sm">
              <User size={32} color="#0EA5E9" weight="duotone" />
            </View>
            <View className="flex-1">
              <ClinicalText variant="h2" color="primary" numberOfLines={1}>
                {patientName}
              </ClinicalText>
              <ClinicalText variant="caption" color="secondary" mono className="mt-0.5">
                Record ID: {id}
              </ClinicalText>
              <ClinicalText variant="tiny" color="muted" className="mt-1">
                Captured: {date}
              </ClinicalText>
            </View>
          </View>
        </GlassCard>

        {/* Card 2: Clinical Data & Affected Limb */}
        <GlassCard density="standard" elevation="soft" radius="3xl" className="p-5 mb-4">
          <ClinicalText variant="h3" color="primary" className="mb-3">
            Anatomical Target
          </ClinicalText>

          <View className="flex-row items-center gap-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
            <View className="w-11 h-11 rounded-xl bg-sky-100 items-center justify-center">
              <Bone size={24} color="#0EA5E9" weight="duotone" />
            </View>
            <View className="flex-1">
              <ClinicalText variant="caption" color="secondary">
                Affected Limb & Region
              </ClinicalText>
              <ClinicalText variant="bodyMedium" color="primary" className="font-bold">
                {side} {region}
              </ClinicalText>
              <ClinicalText variant="tiny" color="muted" className="mt-0.5">
                Target: Custom Orthopedic Immobilization Splint
              </ClinicalText>
            </View>
          </View>
        </GlassCard>

        {/* Card 3: Processing & Mesh Status */}
        <GlassCard density="standard" elevation="soft" radius="3xl" className="p-5 mb-4">
          <ClinicalText variant="h3" color="primary" className="mb-3">
            Processing Status
          </ClinicalText>

          {isProcessing ? (
            <View className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl flex-row items-center gap-3.5">
              <ActivityIndicator size="small" color="#D97706" />
              <View className="flex-1">
                <ClinicalText variant="bodyMedium" color="warning" className="font-semibold">
                  Render in progress...
                </ClinicalText>
                <ClinicalText variant="caption" color="secondary" className="mt-0.5">
                  Estimated time remaining: ~2 min
                </ClinicalText>
              </View>
            </View>
          ) : (
            <View className="bg-emerald-50/90 border border-emerald-200/90 p-4 rounded-2xl flex-row items-center gap-3.5">
              <CheckCircle size={28} color="#059669" weight="fill" />
              <View className="flex-1">
                <ClinicalText variant="bodyMedium" color="success" className="font-semibold">
                  3D Mesh Generation Complete
                </ClinicalText>
                <ClinicalText variant="caption" color="secondary" className="mt-0.5">
                  Topology validated for additive 3D manufacturing
                </ClinicalText>
              </View>
            </View>
          )}

          {/* Specifications Grid */}
          <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-between">
            <View>
              <ClinicalText variant="tiny" color="muted">
                Material Thickness
              </ClinicalText>
              <ClinicalText variant="bodyMedium" color="primary" mono className="font-bold mt-0.5">
                {params.thickness || '2.4'} mm
              </ClinicalText>
            </View>
            <View>
              <ClinicalText variant="tiny" color="muted">
                Ventilation Pattern
              </ClinicalText>
              <ClinicalText variant="bodyMedium" color="primary" className="font-bold mt-0.5">
                {params.density || 'Standard'}
              </ClinicalText>
            </View>
            <View>
              <ClinicalText variant="tiny" color="muted">
                Manufacturing
              </ClinicalText>
              <ClinicalText variant="bodyMedium" color="brand" className="font-bold mt-0.5">
                FDM Medical Grade
              </ClinicalText>
            </View>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Primary Action Button (Bottom) */}
      {isReadyOrPrinted && (
        <View
          style={{ paddingBottom: insets.bottom + 16 }}
          className="absolute bottom-0 left-0 right-0 px-5 pt-3 bg-white/90 border-t border-slate-200/70"
        >
          <Pressable
            onPress={handleOpenViewer}
            className="w-full h-14 bg-sky-500 active:bg-sky-600 rounded-2xl flex-row items-center justify-center gap-2.5 shadow-md shadow-sky-500/30"
          >
            <Eye size={22} color="#FFFFFF" weight="bold" />
            <ClinicalText variant="bodyMedium" color="white" className="font-bold tracking-wide">
              Open 3D Viewer
            </ClinicalText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
