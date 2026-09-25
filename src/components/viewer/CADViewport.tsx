import React from 'react';
import { View } from 'react-native';
import { Cube } from 'phosphor-react-native/src/icons/Cube';
import { ClinicalText } from '@/components/ui/clinical-text';

const GRID_KEYS = ['0', '1', '2', '3', '4', '5'];

/**
 * CADViewport
 * Pure, stateless blueprint CAD viewport simulation.
 */
export function CADViewport() {
  return (
    <View
      className="w-full h-72 rounded-4xl overflow-hidden mb-6 bg-slate-950 border border-white/60"
      style={{
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 5,
      }}
    >
      {/* Subtle Grid Lines Background */}
      <View className="absolute inset-0 opacity-15" pointerEvents="none">
        <View className="w-full h-full flex-row justify-between">
          {GRID_KEYS.map((key) => (
            <View key={`grid-v-${key}`} className="w-px h-full bg-sky-400" />
          ))}
        </View>
        <View className="absolute inset-0 justify-between">
          {GRID_KEYS.map((key) => (
            <View key={`grid-h-${key}`} className="h-px w-full bg-sky-400" />
          ))}
        </View>
      </View>

      {/* Medical / CAD Circular Reticle */}
      <View
        className="absolute inset-0 items-center justify-center"
        pointerEvents="none"
      >
        <View className="w-40 h-40 border border-dashed border-sky-400/20 rounded-full items-center justify-center">
          <View className="w-20 h-20 border border-sky-400/25 rounded-full items-center justify-center">
            <View className="w-2 h-2 rounded-full bg-sky-400/50" />
          </View>
        </View>
      </View>

      {/* Flex Column Layout */}
      <View className="flex-1 justify-between p-4">
        {/* Top Header Badges */}
        <View className="flex-row items-center justify-between">
          <View className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <ClinicalText variant="tiny" color="brand" mono>
              CAD VIEWPORT • ISO-3D
            </ClinicalText>
          </View>
          <View className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <ClinicalText variant="tiny" color="white" mono>
              L: 184mm
            </ClinicalText>
          </View>
        </View>

        {/* Center Visual CAD Preview */}
        <View className="items-center justify-center my-auto py-2">
          <View className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-400/40 items-center justify-center mb-3 shadow-md shadow-sky-500/30">
            <Cube size={36} color="#38BDF8" weight="duotone" />
          </View>
          <ClinicalText variant="bodyMedium" color="white" className="font-semibold text-center">
            Render Preview
          </ClinicalText>
          <ClinicalText variant="tiny" color="brand" mono className="mt-1 text-center">
            Mesh: 42,890 Vertices • Manifold OK
          </ClinicalText>
        </View>

        {/* Bottom Coordinate Bar */}
        <View className="flex-row items-center justify-between pt-1">
          <ClinicalText variant="tiny" color="muted" mono>
            Scale: 1:1 Anatomical
          </ClinicalText>
          <ClinicalText variant="tiny" color="muted" mono>
            Rotation: [14°, 32°, -5°]
          </ClinicalText>
        </View>
      </View>
    </View>
  );
}
export default CADViewport;
