import React, { useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  const updateScan = useScanStore((state) => state.updateScan);
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

    // Save or update in global Zustand store
    if (params.id) {
      updateScan(params.id, {
        patientName: patientDisplayName,
        region: params.region || 'Radius/Ulna',
        side: params.side || 'Right',
        status: 'completed',
        badgeStatus: 'printed',
        thickness: currentParamsRef.current.thickness,
        density: currentParamsRef.current.density,
        strutsEnabled: currentParamsRef.current.strutsEnabled,
      });
    } else {
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
    }

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
    <View className="flex-1">
      {/* Explicitly disable navigation header to prevent any injected elements */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 2. Background Gradient */}
      <LinearGradient
        colors={['#E3F2FD', '#F4F9FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 1. Top Clinical Header with safe-area spacing */}
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
          <ClinicalText variant="h2" color="primary" numberOfLines={1}>
            Patient: {patientDisplayName}
          </ClinicalText>
          <ClinicalText variant="caption" color="secondary" numberOfLines={1} className="mt-0.5">
            Scan ID: {params.id || 'SPL-RAD-04'} • {anatomicalContext}
            {isReadOnly ? ' (Archived)' : ''}
          </ClinicalText>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingBottom: isReadOnly ? insets.bottom + 32 : insets.bottom + 110,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* CAD Viewport Simulation */}
        <CADViewport />

        {/* 3. Glassmorphism Splint Parameter Controls */}
        <ParameterControls
          initialThickness={initialThickness}
          initialDensity={initialDensity}
          onParametersChange={(updated) => {
            currentParamsRef.current = updated;
          }}
        />
      </ScrollView>

      {/* 4. Floating CTA Button */}
      {!isReadOnly && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: insets.bottom + 16,
            backgroundColor: 'transparent',
          }}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={handlePrint}
            style={{
              marginHorizontal: 20,
              height: 56,
              borderRadius: 100,
              backgroundColor: '#007AFF',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
            className="active:opacity-90"
          >
            <Printer size={22} color="#FFFFFF" weight="bold" />
            <ClinicalText variant="bodyMedium" color="white" className="font-bold tracking-wide text-[16px]">
              Approve & Send to Printer
            </ClinicalText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
