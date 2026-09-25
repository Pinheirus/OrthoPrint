import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

export default function CameraCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientName?: string;
    region?: string;
    side?: string;
  }>();
  const { patientName, region, side } = params;
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Permission: still resolving ──────────────────────────────────────────
  if (!permission) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  // ── Permission: denied ───────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={s.center}>
        <Text style={s.deniedText}>Camera access is required.</Text>
        <TouchableOpacity style={s.grantBtn} onPress={requestPermission}>
          <Text style={s.grantBtnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.grantBtn, { marginTop: 12, backgroundColor: '#475569' }]}
          onPress={() => router.back()}
        >
          <Text style={s.grantBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Permission: granted — bare camera ────────────────────────────────────
  const handleCapture = async () => {
    if (isScanning) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsScanning(true);
    scanTimeoutRef.current = setTimeout(async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: '/processing',
        params: { patientName, region, side },
      });
    }, 2500);
  };

  const guidanceText = `Align patient's ${region ? region.toLowerCase() : 'limb'} within the frame`;

  return (
    <View style={s.root}>
      {/* Camera fills the entire screen via flex: 1 */}
      <CameraView style={s.camera} facing="back" />

      {/* Dynamic guidance pill */}
      <View style={s.guidanceBadge}>
        <Text style={s.guidanceText}>{guidanceText}</Text>
      </View>

      {/* Single debug capture button */}
      <TouchableOpacity
        style={[s.captureBtn, isScanning && s.captureBtnScanning]}
        onPress={handleCapture}
        activeOpacity={0.7}
        disabled={isScanning}
      >
        <View style={s.captureBtnInner} />
      </TouchableOpacity>

      {/* Minimal scanning indicator */}
      {isScanning && (
        <View style={s.scanningBadge}>
          <Text style={s.scanningText}>Capturing…</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  deniedText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  grantBtn: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  grantBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  captureBtn: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnScanning: {
    borderColor: '#FBBF24',
    backgroundColor: 'rgba(251,191,36,0.25)',
  },
  captureBtnInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },
  scanningBadge: {
    position: 'absolute',
    bottom: 152,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanningText: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '600',
  },
  guidanceBadge: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: '90%',
  },
  guidanceText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
