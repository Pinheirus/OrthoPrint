import React, { useCallback } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'phosphor-react-native/src/icons/ArrowLeft';
import { Camera } from 'phosphor-react-native/src/icons/Camera';
import { User } from 'phosphor-react-native/src/icons/User';
import { IdentificationCard } from 'phosphor-react-native/src/icons/IdentificationCard';
import { ClinicalText } from '@/components/ui/clinical-text';
import { useScanStore, ScanStatus, StatusBadgeType } from '@/store/useScanStore';

const ANATOMICAL_REGIONS = ['Forearm', 'Wrist', 'Hand', 'Thumb'] as const;
type AnatomicalRegion = (typeof ANATOMICAL_REGIONS)[number];

type Laterality = 'Left' | 'Right';

export default function NewScanScreen() {
  const insets = useSafeAreaInsets();

  const draftScan = useScanStore((state) => state.draftScan);
  const setDraftData = useScanStore((state) => state.setDraftData);
  const resetDraft = useScanStore((state) => state.resetDraft);
  const addScan = useScanStore((state) => state.addScan);

  // ── Reset draft form on every focus ──────────────────────────────────────
  // Guaranteed clean slate whenever the screen comes into focus for a new scan
  useFocusEffect(
    useCallback(() => {
      resetDraft();
    }, [resetDraft]),
  );

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  };

  const handleRegionSelect = (region: AnatomicalRegion) => {
    Haptics.selectionAsync();
    setDraftData({ region });
  };

  const handleLateralitySelect = (side: Laterality) => {
    Haptics.selectionAsync();
    setDraftData({ side });
  };

  const handleInitializeScanner = () => {
    const patientName = draftScan.patientName.trim();
    if (!patientName) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Required Field', 'Please enter the patient name before proceeding.');
      return;
    }

    const newScanId = `scan-${Date.now()}`;
    const newPatientData = {
      id: newScanId,
      patientName,
      region: draftScan.region,
      side: draftScan.side,
      status: 'processing' as ScanStatus,
      badgeStatus: 'processing' as StatusBadgeType,
      thickness: 2.4,
      density: 'Standard',
      strutsEnabled: true,
      date: 'Just now',
    };

    // 1. Add to global Zustand store (so it appears immediately on Dashboard)
    addScan(newPatientData);

    // 2. Clear draft state
    resetDraft();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/camera-capture',
      params: {
        id: newScanId,
        patientName: newPatientData.patientName,
        region: newPatientData.region,
        side: newPatientData.side,
      },
    });
  };

  const isWeb = Platform.OS === 'web';
  const GLASS_CARD_STYLE = {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 24,
    overflow: 'hidden' as const,
  };

  return (
    <View className="flex-1">
      {/* Background Gradient: white at top fading to soft clinical blue at bottom */}
      <LinearGradient
        colors={['#FFFFFF', '#F0F8FF', '#D6EAF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Clinical Header */}
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
            Pre-Scan Calibration
          </ClinicalText>
          <ClinicalText variant="h2" color="primary" numberOfLines={1}>
            New Clinical Scan
          </ClinicalText>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section 1: Patient Information */}
          <BlurView
            intensity={50}
            tint="light"
            style={[
              GLASS_CARD_STYLE,
              { marginTop: 16 },
              isWeb && ({
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              } as any),
            ]}
          >
            <ClinicalText variant="h3" color="primary" className="mb-1">
              Patient Details
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary" className="mb-4">
              Metadata attached to clinical 3D printable records
            </ClinicalText>

            {/* Patient Name Input */}
            <View className="mb-3.5">
              <ClinicalText variant="caption" color="secondary" className="font-semibold mb-1.5 ml-1">
                Patient Name
              </ClinicalText>
              <View className="flex-row items-center bg-white/90 border border-slate-200/90 rounded-2xl px-3.5 h-12 shadow-sm">
                <User size={18} color="#64748B" weight="regular" />
                <TextInput
                  value={draftScan.patientName}
                  onChangeText={(text) => setDraftData({ patientName: text })}
                  placeholder="e.g., Eleanor Vance"
                  placeholderTextColor="#94A3B8"
                  className="flex-1 ml-2.5 text-[15px] text-slate-900 font-sans"
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Patient ID / Medical Record # */}
            <View>
              <ClinicalText variant="caption" color="secondary" className="font-semibold mb-1.5 ml-1">
                Medical Record # (Optional)
              </ClinicalText>
              <View className="flex-row items-center bg-white/90 border border-slate-200/90 rounded-2xl px-3.5 h-12 shadow-sm">
                <IdentificationCard size={18} color="#64748B" weight="regular" />
                <TextInput
                  value={draftScan.medicalRecord}
                  onChangeText={(text) => setDraftData({ medicalRecord: text })}
                  placeholder="e.g., MRN-8849-B"
                  placeholderTextColor="#94A3B8"
                  className="flex-1 ml-2.5 text-[15px] text-slate-900 font-sans"
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </BlurView>

          {/* Section 2: Anatomical Region */}
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
            <ClinicalText variant="h3" color="primary" className="mb-1">
              Anatomical Region
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary" className="mb-3.5">
              Optimizes point-cloud topology algorithms for joint articulation
            </ClinicalText>

            <View className="flex-row flex-wrap gap-2">
              {ANATOMICAL_REGIONS.map((region) => {
                const isSelected = draftScan.region === region;
                return (
                  <Pressable
                    key={region}
                    onPress={() => handleRegionSelect(region)}
                    className={`py-2.5 px-5 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-sky-500 border-sky-500 shadow-sm shadow-sky-500/20'
                        : 'bg-white/80 border-slate-200/80 active:bg-slate-100'
                    }`}
                  >
                    <ClinicalText
                      variant="bodyMedium"
                      color={isSelected ? 'white' : 'primary'}
                      className={isSelected ? 'font-bold' : 'font-medium'}
                    >
                      {region}
                    </ClinicalText>
                  </Pressable>
                );
              })}
            </View>
          </BlurView>

          {/* Section 3: Laterality */}
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
            <ClinicalText variant="h3" color="primary" className="mb-1">
              Limb Laterality
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary" className="mb-3.5">
              Select anatomical orientation for mirrored splint geometry
            </ClinicalText>

            <View className="flex-row bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 gap-1.5">
              {(['Left', 'Right'] as Laterality[]).map((side) => {
                const isSelected = draftScan.side === side;
                return (
                  <Pressable
                    key={side}
                    onPress={() => handleLateralitySelect(side)}
                    className={`flex-1 py-3 rounded-xl items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-sky-500 shadow-sm'
                        : 'bg-transparent active:bg-slate-200/50'
                    }`}
                  >
                    <ClinicalText
                      variant="bodyMedium"
                      color={isSelected ? 'white' : 'primary'}
                      className={isSelected ? 'font-bold' : 'font-medium'}
                    >
                      {side} Limb
                    </ClinicalText>
                  </Pressable>
                );
              })}
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Primary Sticky Bottom Action Button */}
      <View
        style={{
          paddingBottom: insets.bottom + 16,
          backgroundColor: 'transparent',
        }}
        className="absolute bottom-0 left-0 right-0 px-5"
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleInitializeScanner}
          style={{
            marginBottom: 16,
            borderRadius: 100,
            shadowColor: '#0284C7',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }}
          className="w-full h-14 bg-sky-500 active:bg-sky-600 flex-row items-center justify-center gap-2.5"
        >
          <Camera size={22} color="#FFFFFF" weight="bold" />
          <ClinicalText variant="bodyMedium" color="white" className="font-bold tracking-wide">
            Initialize LiDAR Scanner
          </ClinicalText>
        </Pressable>
      </View>
    </View>
  );
}
