import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/glass-card';
import { ClinicalText } from '@/components/ui/clinical-text';
import { Colors } from '@/constants/tokens';

const STATUS_MESSAGES = [
  'Analyzing point cloud geometry...',
  'Generating 3D mesh...',
  'Calculating structural integrity...',
  'Finalizing splint parameters...',
];

const TOTAL_DURATION_MS = 6000;
const STEP_INTERVAL_MS = 1500;

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientName?: string;
    region?: string;
    side?: string;
  }>();
  const { patientName, region, side } = params;
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    // Cycle through status messages every 1.5 seconds
    const intervalId = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, STEP_INTERVAL_MS);

    // Global timeout to complete simulation, trigger haptics, and route to viewer
    const timeoutId = setTimeout(async () => {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        // Haptics fail gracefully in non-supported environments (e.g. web/simulators)
      }
      router.replace({
        pathname: '/viewer',
        params: { patientName, region, side },
      });
    }, TOTAL_DURATION_MS);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [router, patientName, region, side]);

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Background Linear Gradient (Light Clinical Blue to White) */}
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

      {/* Floating Central GlassCard */}
      <GlassCard
        density="dense"
        intensity={70}
        elevation="lg"
        radius="4xl"
        className="w-full max-w-sm items-center py-10 px-6"
      >
        {/* Large Primary Loading Spinner */}
        <View className="mb-8 items-center justify-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>

        {/* Section Tag */}
        <ClinicalText
          variant="tiny"
          color="brand"
          align="center"
          className="uppercase tracking-widest mb-2"
        >
          LiDAR Computation
        </ClinicalText>

        {/* Dynamic Simulated Status Text (IBM Plex Mono) */}
        <ClinicalText
          variant="bodyMedium"
          color="primary"
          mono
          align="center"
          className="min-h-[48px] px-2"
        >
          {STATUS_MESSAGES[statusIndex]}
        </ClinicalText>

        {/* Progress Hint */}
        <View className="mt-6 flex-row items-center gap-1.5">
          {STATUS_MESSAGES.map((msg, i) => (
            <View
              key={`status-dot-${msg}`}
              className={`h-1.5 rounded-full transition-all ${
                i === statusIndex
                  ? 'w-6 bg-sky-500'
                  : i < statusIndex
                  ? 'w-2 bg-sky-300'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </View>
      </GlassCard>
    </View>
  );
}
