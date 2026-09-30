/**
 * OnboardingScreen — 2-step Cashio-inspired premium flow
 *
 * Step 0 · Intro      — Central hub + 4 orbiting satellite icons (continuous float loops)
 * Step 1 · Setup      — Glassmorphic BlurView card with Dr./Dra. toggle + last-name input
 *
 * Shared footer in both steps:
 *   • Pagination dots (active dot is blue + wider, inactive is slate-200)
 *   • Full-width pill CTA  ("Continue" → "Get Started")
 *
 * Architecture notes:
 *   - All satellite animations run on the native thread (useNativeDriver: true)
 *   - Step transition is a cross-fade driven by Animated.timing on `transitionAnim`
 *   - KeyboardAvoidingView wraps Step 1 so the form stays visible when keyboard opens
 *   - useDoctorStore (Zustand) persists title + lastName; completeOnboarding() gates
 *     the Dashboard redirect in index.tsx
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

// ── Phosphor icons (same set used throughout the app) ──────────────────────────
import { Bone } from 'phosphor-react-native/src/icons/Bone';
import { CubeTransparent } from 'phosphor-react-native/src/icons/CubeTransparent';
import { Crosshair } from 'phosphor-react-native/src/icons/Crosshair';
import { FirstAid } from 'phosphor-react-native/src/icons/FirstAid';
import { Stethoscope } from 'phosphor-react-native/src/icons/Stethoscope';
import { ArrowRight } from 'phosphor-react-native/src/icons/ArrowRight';

import { useDoctorStore, DoctorTitle } from '@/store/useDoctorStore';

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Orbit satellite definitions — position offsets are relative to the 280×280 stage */
const SATELLITES = [
  {
    id: 'top',
    Icon: Crosshair,
    color: '#06B6D4',
    size: 26,
    style: { top: 0, alignSelf: 'center' as const },
    phaseOffset: 0,
    amplitude: 10,
    duration: 2000,
  },
  {
    id: 'left',
    Icon: Bone,
    color: '#007AFF',
    size: 24,
    style: { left: 0, top: '50%' as any, marginTop: -27 },
    phaseOffset: 500,
    amplitude: 8,
    duration: 1800,
  },
  {
    id: 'right',
    Icon: CubeTransparent,
    color: '#8B5CF6',
    size: 26,
    style: { right: 0, top: '50%' as any, marginTop: -27 },
    phaseOffset: 900,
    amplitude: 12,
    duration: 2300,
  },
  {
    id: 'bottom',
    Icon: FirstAid,
    color: '#10B981',
    size: 24,
    style: { bottom: 0, alignSelf: 'center' as const },
    phaseOffset: 1300,
    amplitude: 9,
    duration: 2100,
  },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setDoctorProfile, completeOnboarding } = useDoctorStore();

  // ── Screen step state ────────────────────────────────────────────────────────
  const [step, setStep] = useState<0 | 1>(0);

  // ── Doctor form state ────────────────────────────────────────────────────────
  const [title, setTitle] = useState<DoctorTitle>('Dr.');
  const [lastName, setLastName] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // ── Animation refs ───────────────────────────────────────────────────────────
  // One Animated.Value per satellite for independent float loops
  const floatAnims = useRef(SATELLITES.map(() => new Animated.Value(0))).current;

  // Center orb gentle bob (slower, larger)
  const centerFloat = useRef(new Animated.Value(0)).current;

  // Cross-fade between the two visual panels
  const introOpacity = useRef(new Animated.Value(1)).current;
  const setupOpacity = useRef(new Animated.Value(0)).current;
  const setupTranslateY = useRef(new Animated.Value(20)).current;

  // CTA button press scale
  const ctaScale = useRef(new Animated.Value(1)).current;

  // ── Start floating animations on mount ──────────────────────────────────────
  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];

    const makeFloat = (
      anim: Animated.Value,
      amplitude: number,
      duration: number,
    ) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -amplitude,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: amplitude * 0.4,
            duration: duration * 0.85,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration * 0.55,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );

    // Stagger satellite start times so they never sync
    SATELLITES.forEach((sat, i) => {
      const loop = makeFloat(floatAnims[i], sat.amplitude, sat.duration);
      loops.push(loop);
      const timeout = setTimeout(() => loop.start(), sat.phaseOffset);
      // Store timeout id for cleanup
      (loop as any).__timeout = timeout;
    });

    // Center orb — slow, large
    const centerLoop = makeFloat(centerFloat, 7, 3000);
    loops.push(centerLoop);
    centerLoop.start();

    return () => {
      loops.forEach((l) => {
        clearTimeout((l as any).__timeout);
        l.stop();
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step transition ──────────────────────────────────────────────────────────
  const goToStep1 = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });

    // Fade intro out, slide-fade setup in
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(setupOpacity, {
        toValue: 1,
        duration: 320,
        delay: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(setupTranslateY, {
        toValue: 0,
        duration: 380,
        delay: 160,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start(() => setStep(1));
  }, [introOpacity, setupOpacity, setupTranslateY]);

  // ── Complete handler ─────────────────────────────────────────────────────────
  const handleComplete = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) { }
    setDoctorProfile(title, lastName);
    completeOnboarding();
    router.replace('/');
  }, [title, lastName, setDoctorProfile, completeOnboarding, router]);

  // ── CTA press feedback ───────────────────────────────────────────────────────
  const onCtaPressIn = () => {
    Animated.spring(ctaScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };
  const onCtaPressOut = () => {
    Animated.spring(ctaScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const canFinish = lastName.trim().length > 0;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ headerShown: false, headerLeft: () => null, headerRight: () => null }} />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

        {/* ── Icy-Blue Gradient ── */}
        <LinearGradient
          colors={['#E3F2FD', '#F4F9FF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* ── Main Layout: Visual Stage (flex:1) + Footer (fixed) ── */}
        <View
          style={[
            styles.screen,
            {
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >

          {/* ════════════════════════════════════════════
            VISUAL STAGE  — takes all remaining space
            ════════════════════════════════════════════ */}
          <View style={styles.visualStage}>

            {/* ── STEP 0: Orbit ──────────────────────────────────────── */}
            <Animated.View
              style={[styles.panelAbsolute, { opacity: introOpacity }]}
              pointerEvents={step === 0 ? 'auto' : 'none'}
            >
              <OrbitVisual floatAnims={floatAnims} centerFloat={centerFloat} />
            </Animated.View>

            {/* ── STEP 1: Glass Setup Card ────────────────────────────── */}
            <Animated.View
              style={[
                styles.panelAbsolute,
                {
                  opacity: setupOpacity,
                  transform: [{ translateY: setupTranslateY }],
                },
              ]}
              pointerEvents={step === 1 ? 'auto' : 'none'}
            >
              <SetupCard
                title={title}
                onTitleChange={setTitle}
                lastName={lastName}
                onLastNameChange={setLastName}
                inputFocused={inputFocused}
                onInputFocus={() => setInputFocused(true)}
                onInputBlur={() => setInputFocused(false)}
              />
            </Animated.View>

          </View>

          {/* ════════════════════════════════════════════
            FOOTER — fixed height, always visible
            ════════════════════════════════════════════ */}
          <View style={styles.footer}>

            {/* Step text (transitions in-place) */}
            {!isKeyboardVisible && (
              <View style={styles.textBlock}>
                <Text style={styles.footerTitle}>
                  {step === 0 ? 'Férulas de grado clínico' : 'Personalice su panel de control'}
                </Text>
                <Text style={styles.footerSubtitle}>
                  {step === 0
                    ? 'Escanee los miembros afectados usando LiDAR y genere férulas imprimibles en 3D en minutos.'
                    : 'Ingrese sus datos clínicos para configurar su espacio de trabajo.'}
                </Text>
              </View>
            )}

            {/* Pagination dots */}
            {!isKeyboardVisible && (
              <View style={styles.dotsRow} accessibilityRole="progressbar">
                <View style={[styles.dot, step === 0 && styles.dotActive]} />
                <View style={[styles.dot, step === 1 && styles.dotActive]} />
              </View>
            )}

            {/* CTA Button */}
            <Animated.View style={[styles.ctaWrapper, { marginTop: 16, transform: [{ scale: ctaScale }] }]}>
              <Pressable
                onPress={step === 0 ? goToStep1 : handleComplete}
                onPressIn={onCtaPressIn}
                onPressOut={onCtaPressOut}
                accessibilityRole="button"
                accessibilityLabel={step === 0 ? 'Continuar a configuración de médico' : 'Comenzar con el panel'}
                style={[styles.ctaButton, { backgroundColor: '#007AFF' }]}
              >
                <View style={styles.ctaGradient}>
                  <Text style={styles.ctaLabel}>
                    {step === 0 ? 'Continuar' : 'Comenzar'}
                  </Text>
                  <ArrowRight size={20} color="#FFFFFF" weight="bold" />
                </View>
              </Pressable>
            </Animated.View>

            {/* Hint text — only on step 1 when name is empty */}
            {step === 1 && !canFinish && (
              <Text style={styles.hint}>Ingrese su apellido para continuar</Text>
            )}

          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── OrbitVisual ──────────────────────────────────────────────────────────────
interface OrbitVisualProps {
  floatAnims: Animated.Value[];
  centerFloat: Animated.Value;
}

function OrbitVisual({ floatAnims, centerFloat }: OrbitVisualProps) {
  return (
    <View style={orbitStyles.stage}>
      {/* Ambient glow ring behind the center orb */}
      <View style={orbitStyles.glowRing} />

      {/* 4 orbiting satellite icons */}
      {SATELLITES.map((sat, i) => (
        <Animated.View
          key={sat.id}
          style={[
            orbitStyles.satellite,
            sat.style,
            {
              shadowColor: sat.color,
              transform: [{ translateY: floatAnims[i] }],
            },
          ]}
        >
          <sat.Icon size={sat.size} color={sat.color} weight="duotone" />
        </Animated.View>
      ))}

      {/* Center hub orb */}
      <Animated.View
        style={[
          orbitStyles.centerOrb,
          { transform: [{ translateY: centerFloat }] },
        ]}
      >
        {/* Inner glow layer */}
        <View style={orbitStyles.centerInnerGlow} />
        <Stethoscope size={52} color="#007AFF" weight="duotone" />
      </Animated.View>
    </View>
  );
}

// ── SetupCard ────────────────────────────────────────────────────────────────
interface SetupCardProps {
  title: DoctorTitle;
  onTitleChange: (t: DoctorTitle) => void;
  lastName: string;
  onLastNameChange: (v: string) => void;
  inputFocused: boolean;
  onInputFocus: () => void;
  onInputBlur: () => void;
}

const TITLE_OPTS: { value: DoctorTitle; label: string; sub: string }[] = [
  { value: 'Dr.', label: 'Dr.', sub: 'Masculino' },
  { value: 'Dra.', label: 'Dra.', sub: 'Femenino' },
];

function SetupCard({
  title,
  onTitleChange,
  lastName,
  onLastNameChange,
  inputFocused,
  onInputFocus,
  onInputBlur,
}: SetupCardProps) {
  return (
    <View style={{ paddingHorizontal: 24, marginTop: 60, width: '100%' }}>
      {/* Brand chip */}
      <View style={setupStyles.chip}>
        <Text style={setupStyles.chipText}>ORTHOPRINT · TEKOVÉ</Text>
      </View>

      {/* Section label */}
      <Text style={setupStyles.sectionLabel}>SU TÍTULO CLÍNICO</Text>

      {/* Dr. / Dra. toggle */}
      <BlurView intensity={50} tint="light" style={setupStyles.toggle}>
        {TITLE_OPTS.map((opt) => {
          const active = title === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                Haptics.selectionAsync().catch(() => { });
                onTitleChange(opt.value);
              }}
              style={[setupStyles.pill, active && setupStyles.pillActive]}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`${opt.label} — ${opt.sub}`}
            >
              <Text style={[setupStyles.pillLabel, active && setupStyles.pillLabelActive]}>
                {opt.label}
              </Text>
              <Text style={[setupStyles.pillSub, active && setupStyles.pillSubActive]}>
                {opt.sub}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>

      {/* Section label */}
      <Text style={[setupStyles.sectionLabel, { marginTop: 18 }]}>APELLIDO</Text>

      {/* Name input */}
      <BlurView intensity={50} tint="light" style={[setupStyles.inputRow, inputFocused && setupStyles.inputRowFocused]}>
        <Text style={setupStyles.prefix}>{title}</Text>
        <TextInput
          style={setupStyles.input}
          value={lastName}
          onChangeText={onLastNameChange}
          placeholder="ej. Fernando"
          placeholderTextColor="#94A3B8"
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          accessibilityLabel="Apellido del médico"
        />
      </BlurView>

      {/* Live preview badge */}
      {lastName.trim().length > 0 && (
        <BlurView intensity={40} tint="light" style={setupStyles.previewBadge}>
          <Text style={setupStyles.previewBadgeText}>
            El panel dirá{' '}
            <Text style={setupStyles.previewHighlight}>
              ¡Hola, {title} {lastName.trim()}!
            </Text>
          </Text>
        </BlurView>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  screen: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // ── Visual Stage ────────────────────────────────────────────────────────────
  visualStage: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },

  // Absolute full-fill panel so both steps overlap cleanly
  panelAbsolute: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },

  textBlock: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  footerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 10,
  },

  footerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },

  // ── Pagination dots ─────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },

  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },

  dotActive: {
    width: 22,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },

  // ── CTA Button ──────────────────────────────────────────────────────────────
  ctaWrapper: {
    width: '100%',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 100,
    // NOTE: no overflow:hidden here — that clips the LinearGradient on Android
  },

  ctaButton: {
    borderRadius: 100,
    overflow: 'hidden',   // clip the gradient pill shape here instead
    width: '100%',
  },

  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },

  ctaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  hint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
  },
});

// ── Orbit visual styles ───────────────────────────────────────────────────────
const orbitStyles = StyleSheet.create({
  stage: {
    width: 280,
    height: 280,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  glowRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 48,
    elevation: 0,
  },

  satellite: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // border is white hairline — same as the GlassCard pattern
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    // shadowColor set inline per satellite
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 14,
    elevation: 8,
  },

  centerOrb: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 12,
  },

  centerInnerGlow: {
    position: 'absolute',
    inset: 10,
    borderRadius: 49,
    backgroundColor: 'rgba(0,122,255,0.04)',
  },
});

// ── Setup card styles ─────────────────────────────────────────────────────────
const setupStyles = StyleSheet.create({
  // Brand chip
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.15)',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#007AFF',
  },

  // Section label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#475569',
    marginBottom: 12,
  },

  // Toggle
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    marginBottom: 48,
  },

  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    // Inactive: transparent background, white border hint
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.4)',
  },

  pillActive: {
    backgroundColor: '#007AFF',
    borderColor: 'transparent',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 5,
  },

  pillLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#64748B',
    lineHeight: 22,
  },
  pillLabelActive: { color: '#FFFFFF' },

  pillSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 1,
  },
  pillSubActive: { color: 'rgba(255,255,255,0.75)' },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    overflow: 'hidden',
  },

  inputRowFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: '#007AFF',
  },

  prefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    padding: 0,
  },

  // Preview badge
  previewBadge: {
    marginTop: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewBadgeText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  previewHighlight: {
    fontWeight: '700',
    color: '#007AFF',
  },
});
