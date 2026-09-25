import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'phosphor-react-native/src/icons/ArrowLeft';
import { MagnifyingGlass } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { GlassSurface } from '@/components/ui/glass-surface';
import { ClinicalText } from '@/components/ui/clinical-text';
import { ScanListItem, ScanListItemData } from '@/components/dashboard';
import { useScanStore, ScanRecord } from '@/store/useScanStore';
import { Colors } from '@/constants/tokens';

export default function AllScansScreen() {
  const insets = useSafeAreaInsets();
  const scans = useScanStore((state) => state.scans);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  };

  const filteredScans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return scans;
    return scans.filter(
      (s) =>
        s.patientName.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.side.toLowerCase().includes(q)
    );
  }, [scans, searchQuery]);

  const handleScanPress = (scanItem: ScanListItemData) => {
    const matchedRecord = scans.find((s) => s.id === scanItem.id);
    router.push({
      pathname: '/scan-details',
      params: {
        id: scanItem.id,
        patientName: matchedRecord?.patientName || scanItem.patientName,
        region: matchedRecord?.region || 'Radius/Ulna',
        side: matchedRecord?.side || 'Right',
        status: matchedRecord?.status || scanItem.status,
        date: matchedRecord?.date || scanItem.timestamp,
        thickness: String(matchedRecord?.thickness ?? 2.4),
        density: matchedRecord?.density ?? 'Standard',
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
            Patient Archives
          </ClinicalText>
          <ClinicalText variant="h2" color="primary" numberOfLines={1}>
            All Clinical Scans
          </ClinicalText>
        </View>
      </View>

      {/* Search Filter Bar */}
      <View className="px-5 pt-1 pb-3">
        <GlassSurface density="dense" elevation="soft" radius="2xl" className="px-3.5 py-1">
          <View className="flex-row items-center h-11">
            <MagnifyingGlass size={18} color="#64748B" weight="bold" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search patient, anatomy, or scan ID..."
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-2.5 text-[15px] text-slate-900 font-sans"
              clearButtonMode="while-editing"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </GlassSurface>
      </View>

      {/* Scans List */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 36,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredScans.length > 0 ? (
          <View className="gap-4">
            {filteredScans.map((scan) => {
              const listItemData: ScanListItemData = {
                id: scan.id,
                patientName: scan.patientName,
                identifier: `SPL-${scan.region.toUpperCase().slice(0, 4)} · ${scan.side} ${scan.region}`,
                status: scan.status,
                badgeStatus: scan.badgeStatus,
                timestamp: scan.date,
              };
              return (
                <ScanListItem
                  key={scan.id}
                  scan={listItemData}
                  onPress={handleScanPress}
                />
              );
            })}
          </View>
        ) : (
          <View className="items-center justify-center py-16 px-6">
            <View className="w-14 h-14 rounded-2xl bg-sky-50 items-center justify-center mb-3">
              <MagnifyingGlass size={26} color="#94A3B8" />
            </View>
            <ClinicalText variant="bodyMedium" color="primary" className="font-semibold text-center">
              No matching clinical records
            </ClinicalText>
            <ClinicalText variant="caption" color="secondary" align="center" className="mt-1">
              Try searching with another patient name or anatomical keyword.
            </ClinicalText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
