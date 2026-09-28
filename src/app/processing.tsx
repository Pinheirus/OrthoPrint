import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Spatial Icons
import { CubeTransparent } from 'phosphor-react-native/src/icons/CubeTransparent';
import { Crosshair } from 'phosphor-react-native/src/icons/Crosshair';
import { Bone } from 'phosphor-react-native/src/icons/Bone';
import { Cube } from 'phosphor-react-native/src/icons/Cube';

const loadingPhases = [
  'Calibrating LiDAR sensor...',
  'Analyzing point cloud geometry...',
  'Generating 3D mesh...',
  'Finalizing structural integrity...',
];

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    patientName?: string;
    region?: string;
    side?: string;
    dimensions?: string; // JSON-stringified clinicalData from ARScanner
  }>();
  const { id, patientName, region, side, dimensions } = params;

  // 2. Synchronized Progress & Text States
  const [phaseIndex, setPhaseIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  // Floating hover animation for spatial satellites and centerpiece
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle continuous hover sequence
    const hoverAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    hoverAnimation.start();

    return () => hoverAnimation.stop();
  }, [floatAnim]);

  // Synchronized progress filling & phase advancement
  useEffect(() => {
    // Animate the bar to the target percentage for the current phase
    const targetValue = ((phaseIndex + 1) / loadingPhases.length) * 100;

    Animated.timing(progress, {
      toValue: targetValue,
      duration: 800, // Quick smooth jump
      useNativeDriver: false,
    }).start();

    // Advance to the next phase after a delay, until finished
    if (phaseIndex < loadingPhases.length - 1) {
      const timer = setTimeout(() => {
        setPhaseIndex((prev) => prev + 1);
      }, 2000); // Wait 2 seconds per phase
      return () => clearTimeout(timer);
    } else {
      // Completed 100%: brief pause, trigger haptics, and route to viewer
      const finishTimer = setTimeout(async () => {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
          // Gracefully handles environments without haptics
        }
        router.replace({
          pathname: '/viewer',
          params: { id, patientName, region, side, dimensions },
        });
      }, 1200);
      return () => clearTimeout(finishTimer);
    }
  }, [phaseIndex, router, id, patientName, region, side, dimensions, progress]);

  // Interpolate progress width from '0%' to '100%'
  const barWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Spatial depth offsets
  const counterFloat = floatAnim.interpolate({
    inputRange: [-10, 0],
    outputRange: [0, -10],
  });

  const centerFloat = floatAnim.interpolate({
    inputRange: [-10, 0],
    outputRange: [-6, 2],
  });

  return (
    <View style={styles.container}>
      {/* 3. Explicitly disable navigation header to prevent any injected icons */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background: Clean Icy-Blue Gradient */}
      <LinearGradient
        colors={['#F0F8FF', '#E3F2FD', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Centerpiece & Floating Spatial Elements Stage */}
      <View style={styles.spatialStage}>
        {/* Ambient Backlight Glow Ring */}
        <View style={styles.ambientBacklight} />

        {/* Floating Icon 1 (Top-Left): LiDAR Target with Cyan Glow */}
        <Animated.View
          style={[
            styles.satelliteIcon,
            styles.topLeftSatellite,
            {
              shadowColor: '#06B6D4',
              transform: [{ translateY: floatAnim }],
            },
          ]}
        >
          <Crosshair size={24} color="#06B6D4" weight="bold" />
        </Animated.View>

        {/* Floating Icon 2 (Top-Right): Bone Icon with Blue Glow */}
        <Animated.View
          style={[
            styles.satelliteIcon,
            styles.topRightSatellite,
            {
              shadowColor: '#007AFF',
              transform: [{ translateY: counterFloat }],
            },
          ]}
        >
          <Bone size={24} color="#007AFF" weight="bold" />
        </Animated.View>

        {/* Floating Icon 3 (Bottom-Left): 3D Cube with Purple Glow */}
        <Animated.View
          style={[
            styles.satelliteIcon,
            styles.bottomLeftSatellite,
            {
              shadowColor: '#8B5CF6',
              transform: [{ translateY: floatAnim }],
            },
          ]}
        >
          <Cube size={24} color="#8B5CF6" weight="bold" />
        </Animated.View>

        {/* Centerpiece: Prominent 3D Mesh Icon in Soft White Glow */}
        <Animated.View
          style={[
            styles.centerpieceWrapper,
            { transform: [{ translateY: centerFloat }] },
          ]}
        >
          <CubeTransparent size={68} color="#007AFF" weight="duotone" />
        </Animated.View>
      </View>

      {/* 1. Sleek, Slim Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: barWidth },
          ]}
        />
      </View>

      {/* Synchronized Text Section */}
      <View style={styles.textContainer}>
        <Text style={styles.metaTitle}>
          LIDAR COMPUTATION
        </Text>
        <Text style={styles.subtitle}>
          {loadingPhases[phaseIndex]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  spatialStage: {
    width: 300,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientBacklight: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 36,
  },
  centerpieceWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  satelliteIcon: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  topLeftSatellite: {
    top: 14,
    left: 18,
  },
  topRightSatellite: {
    top: 20,
    right: 22,
  },
  bottomLeftSatellite: {
    bottom: 22,
    left: 14,
  },
  // Sleek progress bar container
  progressBarContainer: {
    height: 6,
    width: 220,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    textAlign: 'center',
  },
});
