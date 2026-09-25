import React, { useRef } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'phosphor-react-native/src/icons/ArrowLeft';
import { Printer } from 'phosphor-react-native/src/icons/Printer';
import { ClinicalText } from '@/components/ui/clinical-text';
import { CADViewport, ParameterControls, VentilationDensity } from '@/components/viewer';
import { useScanStore } from '@/store/useScanStore';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function ViewerScreen() {
  const insets = useSafeAreaInsets();
  const addScan = useScanStore((state) => state.addScan);
  const showNotification = useNotificationStore((state) => state.showNotification);

  const params = useLocalSearchParams<{
    id?: string;
    patientName?: string;
    region?: string;
    side?: string;
    thickness?: string;
    density?: string;
    isReadOnly?: string;
  }>();

  const isReadOnly = params.isReadOnly === 'true';
  const initialThickness = params.thickness ? parseFloat(params.thickness) : 2.4;
  const initialDensity = (params.density as VentilationDensity) || 'Standard';

  // Keep live adjusted parameters for addScan when approving
  const currentParamsRef = useRef<{
    thickness: number;
    density: VentilationDensity;
    strutsEnabled: boolean;
  }>({
    thickness: initialThickness,
    density: initialDensity,
    strutsEnabled: true,
  });

  const patientDisplayName = params.patientName?.trim() || 'Eleanor Vance';
  const anatomicalContext =
    params.side && params.region
      ? `${params.side} ${params.region}`
      : params.region || params.side || 'Right Radius/Ulna';

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  };

  const handlePrint = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save to global Zustand store (Smart Mock database)
    addScan({
      patientName: patientDisplayName,
      region: params.region || 'Radius/Ulna',
      side: params.side || 'Right',
      status: 'completed',
      badgeStatus: 'printed',
      thickness: currentParamsRef.current.thickness,
      density: currentParamsRef.current.density,
      strutsEnabled: currentParamsRef.current.strutsEnabled,
    });

    Alert.alert(
      'Print Job Sent',
      'The splint geometry has been sent to the 3D printer.',
      [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/');
            // Trigger 5-second simulated hardware print completion toast
            setTimeout(() => {
              showNotification(
                '✅ 3D Print Complete',
                `The splint for ${patientDisplayName} is ready for collection.`,
                4000
              );
            }, 5000);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-transparent">
      {/* 1. TOP CLINICAL CONTEXT BAR */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-5 pb-3 flex-row items-center gap-3 bg-transparent"
      >
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-white/80 border border-white/90 items-center justify-center shadow-sm active:opacity-75"
        >
          <ArrowLeft size={20} color="#0F172A" weight="bold" />
        </Pressable>

        <View className="flex-1 justify-center">
          <ClinicalText variant="h2" color="primary" numberOfLines={1}>
            Patient: {patientDisplayName}
          </ClinicalText>
          <ClinicalText variant="caption" color="secondary" numberOfLines={1} className="mt-0.5">
            Scan ID: {params.id || 'SPL-RAD-04'} • {anatomicalContext}
            {isReadOnly ? ' (Archived)' : ''}
          </ClinicalText>
        </View>
      </View>

      {/* 2. SCROLLABLE CONTENT */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingBottom: isReadOnly ? insets.bottom + 32 : insets.bottom + 104,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Isolated CAD Viewport */}
        <CADViewport />

        {/* Isolated State Parameter Controls */}
        <ParameterControls
          initialThickness={initialThickness}
          initialDensity={initialDensity}
          onParametersChange={(updated) => {
            currentParamsRef.current = updated;
          }}
        />
      </ScrollView>

      {/* 3. PRIMARY ACTION (Docked Solid Bottom CTA - Hidden for Read-Only / Past Scans) */}
      {!isReadOnly && (
        <View
          style={{ paddingBottom: insets.bottom + 16 }}
          className="absolute bottom-0 left-0 right-0 px-5 pt-3 bg-white/90 border-t border-slate-200/70"
        >
          <Pressable
            onPress={handlePrint}
            className="w-full h-14 bg-sky-500 active:bg-sky-600 rounded-2xl flex-row items-center justify-center gap-2.5 shadow-md shadow-sky-500/30"
          >
            <Printer size={22} color="#FFFFFF" weight="bold" />
            <ClinicalText variant="bodyMedium" color="white" className="font-bold tracking-wide">
              Approve & Send to Printer
            </ClinicalText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
