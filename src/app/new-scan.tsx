import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
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

const regionOptions = ['Antebrazo', 'Muñeca', 'Mano', 'Pulgar'];
const lateralityOptions = ['Miembro Izquierdo', 'Miembro Derecho'];

export default function NewScanScreen() {
  const insets = useSafeAreaInsets();
  const addScan = useScanStore((state) => state.addScan);

  // Safe Functional State
  const [patientName, setPatientName] = useState('');
  const [medicalRecord, setMedicalRecord] = useState('');
  const [region, setRegion] = useState('Muñeca');
  const [laterality, setLaterality] = useState('Miembro Derecho');

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    router.replace('/');
  };

  const handleInitializeScanner = () => {
    const trimmedName = patientName.trim();
    if (!trimmedName) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
      Alert.alert('Required Field', 'Please enter the patient name before proceeding.');
      return;
    }

    const newScanId = `scan-${Date.now()}`;
    const newPatientData = {
      id: newScanId,
      patientName: trimmedName,
      region,
      side: laterality.includes('Left') ? 'Left' : 'Right',
      status: 'processing' as ScanStatus,
      badgeStatus: 'processing' as StatusBadgeType,
      thickness: 2.4,
      density: 'Standard',
      strutsEnabled: true,
      date: 'Just now',
    };

    addScan(newPatientData);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

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
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden' as const,
  };

  return (
    // 2. Absolute main wrapper: Standard Icy Gradient
    <LinearGradient
      colors={['#E3F2FD', '#F4F9FF', '#FFFFFF']}
      style={{ flex: 1 }}
    >
      {/* 1. Force Remove Gear Icon via Navigation Options */}
      <Stack.Screen
        options={{
          headerShown: false,
          headerRight: () => null,
          headerLeft: () => null,
        }}
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
            Nuevo Escaneo Clínico
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
          {/* 3. Section 1: Patient Details (BlurView Glass Card) */}
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
                Nombre del Paciente
              </ClinicalText>
              <View className="flex-row items-center bg-white/90 border border-slate-200/90 rounded-2xl px-3.5 h-12 shadow-sm">
                <User size={18} color="#64748B" weight="regular" />
                <TextInput
                  value={patientName}
                  onChangeText={setPatientName}
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
                Nº de Historial Médico (Opcional)
              </ClinicalText>
              <View className="flex-row items-center bg-white/90 border border-slate-200/90 rounded-2xl px-3.5 h-12 shadow-sm">
                <IdentificationCard size={18} color="#64748B" weight="regular" />
                <TextInput
                  value={medicalRecord}
                  onChangeText={setMedicalRecord}
                  placeholder="e.g., MRN-8849-B"
                  placeholderTextColor="#94A3B8"
                  className="flex-1 ml-2.5 text-[15px] text-slate-900 font-sans"
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </BlurView>

          {/* 3. Section 2: Anatomical Region (BlurView Glass Card) */}
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
              Región Anatómica
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary" className="mb-3.5">
              Optimizes point-cloud topology algorithms for joint articulation
            </ClinicalText>

            <View style={styles.optionsRow}>
              {regionOptions.map((item) => {
                const isActive = region === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.pill, isActive && styles.pillActive]}
                    onPress={() => setRegion(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </BlurView>

          {/* 3. Section 3: Limb Laterality (BlurView Glass Card) */}
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
              Lateralidad del Miembro
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary" className="mb-3.5">
              Select anatomical orientation for mirrored splint geometry
            </ClinicalText>

            <View style={styles.optionsRow}>
              {lateralityOptions.map((item) => {
                const isActive = laterality === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.pill, isActive && styles.pillActive]}
                    onPress={() => setLaterality(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
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
            shadowColor: '#007AFF',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }}
          className="w-full h-14 bg-sky-500 active:bg-sky-600 flex-row items-center justify-center gap-2.5"
        >
          <Camera size={22} color="#FFFFFF" weight="bold" />
          <ClinicalText variant="bodyMedium" color="white" className="font-bold tracking-wide">
            Inicializar Escáner LiDAR
          </ClinicalText>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pillActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
