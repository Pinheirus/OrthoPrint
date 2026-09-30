import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  AccessibilityInfo,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useDoctorStore } from '@/store/useDoctorStore';

// Design System UI Primitives
import { ClinicalText } from '@/components/ui';
import { GlassTabBar } from '@/components/navigation';

// Screen Composite Components
import {
  TopAppBar,
  MetricsRow,
  StartNewScanCard,
  ScanListItem,
  ScanListItemData,
  EmptyState,
} from '@/components/dashboard';
import { useScanStore } from '@/store/useScanStore';

function getClinicalGreeting(doctorDisplay: string): string {
  const name = doctorDisplay || 'Doctor';
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Buenos días, ${name}`;
  if (hour >= 12 && hour < 18) return `Buenas tardes, ${name}`;
  return `Buenas noches, ${name}`;
}

/**
 * DashboardScreen
 * Clean composition of Design System primitives and dashboard composite components using NativeWind.
 * Hierarchy: SafeArea → TopAppBar → MetricsRow → ScrollView content list.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scans = useScanStore((state) => state.scans);
  const { hasCompletedOnboarding, fullTitle, title } = useDoctorStore();

  // Redirect to onboarding on first launch (no flash: router.replace is
  // called before the first paint via useEffect with no deps change guard).
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, router]);

  // Build the display name: prefer fullTitle from store, fall back gracefully.
  const doctorDisplay = fullTitle || (title ? title : 'Dr. Lucas');

  const greeting = useMemo(
    () => getClinicalGreeting(doctorDisplay),
    [doctorDisplay],
  );

  const metrics = useMemo(() => {
    const totalToday = scans.length;
    const pendingCount = scans.filter(
      (s) => s.status === 'processing' || s.status === 'error'
    ).length;
    const completedCount = scans.filter((s) => s.status === 'completed').length;
    return {
      totalToday,
      pendingCount,
      completedCount,
    };
  }, [scans]);

  // Floating tab bar is ~80px tall; add generous margin so last card is never clipped
  const scrollBottomPadding = Math.max(insets.bottom + 112, 136);

  const handleStartNewScan = () => {
    router.push('/new-scan');
  };

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

  const handleSettingsPress = () => {
    router.push('/profile');
  };

  return (
    <View className="flex-1">
      {/* Dynamic Background: white at top fading to soft clinical blue at bottom */}
      <LinearGradient
        colors={['#FFFFFF', '#F0F8FF', '#D6EAF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 1. Top App Bar — safe area inset handled internally by TopAppBar */}
      <TopAppBar
        greeting={greeting}
        doctorName={doctorDisplay}
        onAvatarPress={handleSettingsPress}
        onSettingsPress={handleSettingsPress}
        onNotificationsPress={() => router.push('/notifications')}
      />

      {/* 2. Metrics Row */}
      <MetricsRow metrics={metrics} />

      {/* 3. Content List — no top SafeArea needed; left/right insets handled by px-6 */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 4,
          paddingBottom: scrollBottomPadding,
        }}
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel="Escaneos recientes y botón de captura"
      >
        {/* Start New Scan Card */}
        <StartNewScanCard onPress={handleStartNewScan} />

        {/* Section Divider & Case Count */}
        <View className="flex-row justify-between items-center mb-5 px-1">
          <ClinicalText
            variant="bodyMedium"
            color="primary"
            className="text-[15px] font-semibold text-slate-800"
          >
            Escaneos Recientes
          </ClinicalText>
          {scans.length > 0 && (
            <Pressable
              onPress={() => router.push('/all-scans')}
              hitSlop={8}
              className="active:opacity-70"
            >
              <ClinicalText variant="caption" color="brand" className="font-semibold">
                Ver todos ({scans.length})
              </ClinicalText>
            </Pressable>
          )}
        </View>

        {/* Recent Scans or Empty State */}
        {scans.length > 0 ? (
          <View className="gap-5">
            {scans.map((scan) => {
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
          <EmptyState />
        )}
      </ScrollView>

      {/* Floating Glass Tab Bar - Docked only on Dashboard */}
      <GlassTabBar
        activeTab="dashboard"
        onTabPress={(tab) => {
          if (tab === 'new-scan') {
            router.push('/new-scan');
          } else if (tab === 'profile') {
            router.push('/profile');
          }
        }}
      />
    </View>
  );
}
