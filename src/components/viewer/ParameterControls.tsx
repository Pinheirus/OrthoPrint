import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Minus } from 'phosphor-react-native/src/icons/Minus';
import { Plus } from 'phosphor-react-native/src/icons/Plus';
import { ClinicalText } from '@/components/ui/clinical-text';

export type VentilationDensity = 'Baja' | 'Estándar' | 'Alta';

export interface ParameterControlsProps {
  initialThickness?: number;
  initialDensity?: VentilationDensity;
  initialStrutsEnabled?: boolean;
  onParametersChange?: (params: {
    thickness: number;
    density: VentilationDensity;
    strutsEnabled: boolean;
  }) => void;
}

const densityOptions: VentilationDensity[] = ['Baja', 'Estándar', 'Alta'];

const isWeb = Platform.OS === 'web';
const GLASS_CARD_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
  borderColor: 'rgba(255, 255, 255, 0.9)',
  borderWidth: 1.5,
  borderRadius: 20,
  padding: 20,
  marginBottom: 16,
  overflow: 'hidden' as const,
};

/**
 * ParameterControls
 * Manages safe localized state for Thickness, Density, and Struts.
 * Uses Glassmorphism BlurView containers with generous padding and margins.
 */
export function ParameterControls({
  initialThickness = 2.4,
  initialDensity = 'Estándar',
  initialStrutsEnabled = true,
  onParametersChange,
}: ParameterControlsProps) {
  // 1. Initialize Safe State
  const [thickness, setThickness] = useState(initialThickness);
  const [density, setDensity] = useState(initialDensity);
  const [strutsEnabled, setStrutsEnabled] = useState(initialStrutsEnabled);

  // Synchronize state with parent callback without closure race conditions
  useEffect(() => {
    onParametersChange?.({
      thickness: Number(thickness.toFixed(1)),
      density: density as VentilationDensity,
      strutsEnabled,
    });
  }, [thickness, density, strutsEnabled, onParametersChange]);

  return (
    <View className="mb-4">
      <ClinicalText variant="h3" color="primary" className="mb-3 ml-1">
        Parámetros de la Férula
      </ClinicalText>

      {/* Parameter 1: Material Thickness */}
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
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
              Grosor del Material
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary">
              Rigidity vs. patient comfort
            </ClinicalText>
          </View>

          {/* Stepper with safe decrement/increment */}
          <View className="flex-row items-center bg-white/80 rounded-2xl p-1 border border-slate-200/80 shadow-sm">
            <Pressable
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch (e) { }
                setThickness((prev) => Math.max(1.0, prev - 0.2));
              }}
              className="w-9 h-9 rounded-xl bg-white items-center justify-center shadow-sm active:bg-slate-50"
              hitSlop={4}
            >
              <Minus size={16} color="#0F172A" weight="bold" />
            </Pressable>

            <View className="w-18 items-center justify-center px-1">
              <ClinicalText variant="bodyMedium" color="primary" mono className="font-bold">
                {thickness.toFixed(1)} mm
              </ClinicalText>
            </View>

            <Pressable
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch (e) { }
                setThickness((prev) => Math.min(5.0, prev + 0.2));
              }}
              className="w-9 h-9 rounded-xl bg-white items-center justify-center shadow-sm active:bg-slate-50"
              hitSlop={4}
            >
              <Plus size={16} color="#0F172A" weight="bold" />
            </Pressable>
          </View>
        </View>
      </BlurView>

      {/* Parameter 2: Ventilation Density */}
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
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
              Densidad de Ventilación
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary">
              Perforation pattern for skin breathability
            </ClinicalText>
          </View>
        </View>

        {/* 3. Refactored Ventilation Density Buttons using safe .map() */}
        <View style={styles.densityRow}>
          {densityOptions.map((item) => {
            const isActive = density === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch (e) { }
                  setDensity(item);
                }}
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

      {/* Parameter 3: Support Struts */}
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
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
              Soportes Estructurales
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary">
              Reinforced ridges along radial fracture line
            </ClinicalText>
          </View>

          {/* 4. Fix Support Struts Switch */}
          <Switch
            value={strutsEnabled}
            onValueChange={(val) => {
              try {
                Haptics.selectionAsync();
              } catch (e) { }
              setStrutsEnabled(val);
            }}
            trackColor={{ false: '#CBD5E1', true: '#007AFF' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  densityRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    gap: 6,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ParameterControls;
