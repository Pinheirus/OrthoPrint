import React, { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Minus } from 'phosphor-react-native/src/icons/Minus';
import { Plus } from 'phosphor-react-native/src/icons/Plus';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ClinicalText } from '@/components/ui/clinical-text';

export type VentilationDensity = 'Low' | 'Standard' | 'High';

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

/**
 * ParameterControls
 * Manages localized state for Thickness, Density, and Struts.
 * Isolates re-renders to prevent bubbling up to the screen or root layout.
 */
export function ParameterControls({
  initialThickness = 2.4,
  initialDensity = 'Standard',
  initialStrutsEnabled = true,
  onParametersChange,
}: ParameterControlsProps) {
  const [thickness, setThickness] = useState(initialThickness);
  const [density, setDensity] = useState<VentilationDensity>(initialDensity);
  const [strutsEnabled, setStrutsEnabled] = useState(initialStrutsEnabled);

  const adjustThickness = (delta: number) => {
    Haptics.selectionAsync();
    setThickness((prev) => {
      const nextVal = Math.max(1.0, Math.min(5.0, Number((prev + delta).toFixed(1))));
      onParametersChange?.({ thickness: nextVal, density, strutsEnabled });
      return nextVal;
    });
  };

  const handleDensityChange = (newDensity: VentilationDensity) => {
    Haptics.selectionAsync();
    setDensity(newDensity);
    onParametersChange?.({ thickness, density: newDensity, strutsEnabled });
  };

  const handleStrutsToggle = (val: boolean) => {
    Haptics.selectionAsync();
    setStrutsEnabled(val);
    onParametersChange?.({ thickness, density, strutsEnabled: val });
  };

  return (
    <View className="mb-4">
      <ClinicalText variant="h3" color="primary" className="mb-3">
        Splint Parameters
      </ClinicalText>

      {/* Parameter 1: Material Thickness */}
      <GlassSurface density="standard" radius="2xl" className="p-4 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
              Material Thickness
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary">
              Rigidity vs. patient comfort
            </ClinicalText>
          </View>

          {/* Stepper */}
          <View className="flex-row items-center bg-slate-100/90 rounded-2xl p-1 border border-slate-200/80">
            <Pressable
              onPress={() => adjustThickness(-0.1)}
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
              onPress={() => adjustThickness(0.1)}
              className="w-9 h-9 rounded-xl bg-white items-center justify-center shadow-sm active:bg-slate-50"
              hitSlop={4}
            >
              <Plus size={16} color="#0F172A" weight="bold" />
            </Pressable>
          </View>
        </View>
      </GlassSurface>

      {/* Parameter 2: Ventilation Density */}
      <GlassSurface density="standard" radius="2xl" className="p-4 mb-3">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
              Ventilation Density
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary">
              Perforation pattern for skin breathability
            </ClinicalText>
          </View>
        </View>

        {/* Segmented Control */}
        <View className="flex-row bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 gap-1">
          <Pressable
            onPress={() => handleDensityChange('Low')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center transition-all ${
              density === 'Low' ? 'bg-sky-500 shadow-sm' : 'bg-transparent'
            }`}
          >
            <ClinicalText
              variant="caption"
              color={density === 'Low' ? 'white' : 'primary'}
              className={density === 'Low' ? 'font-bold' : 'font-medium'}
            >
              Low
            </ClinicalText>
          </Pressable>

          <Pressable
            onPress={() => handleDensityChange('Standard')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center transition-all ${
              density === 'Standard' ? 'bg-sky-500 shadow-sm' : 'bg-transparent'
            }`}
          >
            <ClinicalText
              variant="caption"
              color={density === 'Standard' ? 'white' : 'primary'}
              className={density === 'Standard' ? 'font-bold' : 'font-medium'}
            >
              Standard
            </ClinicalText>
          </Pressable>

          <Pressable
            onPress={() => handleDensityChange('High')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center transition-all ${
              density === 'High' ? 'bg-sky-500 shadow-sm' : 'bg-transparent'
            }`}
          >
            <ClinicalText
              variant="caption"
              color={density === 'High' ? 'white' : 'primary'}
              className={density === 'High' ? 'font-bold' : 'font-medium'}
            >
              High
            </ClinicalText>
          </Pressable>
        </View>
      </GlassSurface>

      {/* Parameter 3: Support Struts */}
      <GlassSurface density="standard" radius="2xl" className="p-4 mb-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <ClinicalText variant="bodyMedium" color="primary" className="font-semibold">
              Support Struts
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary">
              Reinforced ridges along radial fracture line
            </ClinicalText>
          </View>

          <Switch
            value={strutsEnabled}
            onValueChange={handleStrutsToggle}
            trackColor={{ false: '#CBD5E1', true: '#0EA5E9' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </GlassSurface>
    </View>
  );
}
export default ParameterControls;
