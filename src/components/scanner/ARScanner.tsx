/**
 * ARScanner.tsx
 * Three decoupled sections in one file:
 *   1. ClinicalARScene  — pure Viro 3D layer
 *   2. ScannerUI        — pure React Native overlay
 *   3. ARScanner        — state container (default export)
 */
import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet, View, Text, TouchableOpacity,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  ViroARScene, ViroARSceneNavigator, ViroAmbientLight,
  ViroSphere, ViroPolyline, ViroMaterials,
} from '@reactvision/react-viro';

// ─── Types ───────────────────────────────────────────────────────────────────
type Vec3 = [number, number, number];
type Phase = 'idle' | 'hasA' | 'hasAB';


// ─── Constants ────────────────────────────────────────────────────────────────
const PALETTE = ['#60A5FA', '#34D399', '#A78BFA', '#FBBF24', '#F87171'];
const RS = 196; // reticle size
const CO = 26;  // corner size
const TH = 2.5; // line thickness

// ─── Phase config map — single source of truth for all phase-derived values ──
const PHASE_CONFIG: Record<Phase, {
  btnLabel:   string;
  color:      string;
  statusText: string;
  pillLabel:  string;
  badgeLabel: string | null;
}> = {
  idle: {
    btnLabel:   'Marcar Inicio (Ponto A)',
    color:      '#007AFF',
    statusText: 'Aponte para o Ponto Inicial',
    pillLabel:  'PONTO A',
    badgeLabel: null,
  },
  hasA: {
    btnLabel:   'Marcar Fim (Ponto B)',
    color:      '#00E5A0',
    statusText: 'Aponte para o Ponto Final',
    pillLabel:  'PONTO B',
    badgeLabel: 'A \u2192 ?',
  },
  hasAB: {
    btnLabel:   'Salvar Medida',
    color:      '#007AFF',
    statusText: 'Pronto para salvar',
    pillLabel:  'SALVAR',
    badgeLabel: 'A \u2194 B',
  },
};

// ─── Clinical Protocol — strict 4-step bounding-box sequence (forearm) ────────
const CLINICAL_STEPS = [
  {
    key:         'comprimento',
    label:       'Comprimento Total',
    instruction: 'Meça do início ao fim da área afetada do braço.',
  },
  {
    key:         'altura',
    label:       'Altura (Dorsal)',
    instruction: 'Posicione a câmera acima do braço e meça a altura do dorso ao plano inferior.',
  },
  {
    key:         'largura',
    label:       'Largura (Frontal)',
    instruction: 'Posicione a câmera acima do braço e meça a largura de lado a lado.',
  },
  {
    key:         'profundidade',
    label:       'Profundidade (Perfil)',
    instruction: 'Mova a câmera para a lateral do braço e meça a espessura.',
  },
];

// ─── Materials (module-level, created once) ───────────────────────────────────
ViroMaterials.createMaterials({
  markerA:       { diffuseColor: '#2563EB', lightingModel: 'Blinn' },
  markerB:       { diffuseColor: '#00E5A0', lightingModel: 'Blinn' },
  connector:     { diffuseColor: '#A78BFA', lightingModel: 'Blinn' },
  // Live rubber-band line: teal at ~60 % opacity to distinguish from confirmed line
  rubberband:    { diffuseColor: '#00E5A099', lightingModel: 'Blinn' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ClinicalARScene — Viro 3D layer only, zero React Native UI
//    Receives props via passProps (onHitTest is stable so passProps is fine)
//    Receives pointA/pointB via viroAppProps (reactive)
// ═══════════════════════════════════════════════════════════════════════════════
interface SceneProps {
  onHitTest:         (event: any) => void;
  onTrackingUpdated: (state: number, reason: number) => void;
  sceneNavigator: {
    viroAppProps: {
      pointA:        Vec3 | null;
      pointB:        Vec3 | null;
      dynamicTarget: Vec3 | null; // live rubber-band endpoint
    };
  };
}

const ClinicalARScene = (props: SceneProps) => {
  const { onHitTest, onTrackingUpdated } = props;
  const { pointA, pointB, dynamicTarget } = props.sceneNavigator.viroAppProps;

  // Show live rubber-band only while A is set but B has not been confirmed yet
  const showRubberband = !!pointA && !pointB && !!dynamicTarget;

  return (
    <ViroARScene onTrackingUpdated={onTrackingUpdated} onCameraARHitTest={onHitTest}>
      <ViroAmbientLight color="#ffffff" intensity={1000} />

      {/* Confirmed Point A marker */}
      {pointA && (
        <ViroSphere position={pointA} radius={0.005} materials={['markerA']} />
      )}

      {/* Live rubber-band line: pointA → current camera surface */}
      {showRubberband && (
        <ViroPolyline
          position={[0, 0, 0]}
          points={[pointA!, dynamicTarget!]}
          thickness={0.002}
          materials={['rubberband']}
        />
      )}

      {/* Confirmed A→B line + Point B marker */}
      {pointA && pointB && (
        <>
          <ViroSphere position={pointB} radius={0.005} materials={['markerB']} />
          <ViroPolyline
            position={[0, 0, 0]}
            points={[pointA, pointB]}
            thickness={0.003}
            materials={['connector']}
          />
        </>
      )}
    </ViroARScene>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ScannerUI — pure presentation, zero AR logic
// ═══════════════════════════════════════════════════════════════════════════════
interface ScannerUIProps {
  isTracking:       boolean;
  phase:            Phase;
  currentStepLabel: string | undefined; // e.g. 'Comprimento Total'
  instruction:      string | undefined; // contextual anatomical guidance text
  clinicalData:     Record<string, number>;
  liveDistance:     number | null;       // rubber-band distance in cm, null when inactive
  isDone:           boolean;            // true when all 3 steps are captured
  onAction:         () => void;
  onClear:          () => void;
  onNextStep:       () => void;
}

function ScannerUI({
  isTracking, phase, currentStepLabel, instruction, clinicalData, liveDistance, isDone,
  onAction, onClear, onNextStep,
}: ScannerUIProps) {
  const insets = useSafeAreaInsets();
  const cfg = PHASE_CONFIG[phase];

  const statusColor  = !isTracking ? '#D97706' : (cfg.color === '#00E5A0' ? '#059669' : cfg.color);
  const reticleColor = isTracking && phase !== 'hasAB' ? '#00E5A0' : 'rgba(255,255,255,0.4)';
  const btnDisabled  = !isTracking && phase !== 'hasAB';

  // How many steps have been saved so far
  const savedCount = CLINICAL_STEPS.filter(s => clinicalData[s.key] !== undefined).length;

  return (
    <View style={[StyleSheet.absoluteFill, ui.overlay]} pointerEvents="box-none">

      {/* ── 1. Top Instruction Panel: Glassmorphism BlurView ── */}
      <BlurView
        intensity={60}
        tint="light"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1.5,
          borderRadius: 24,
          padding: 20,
          marginHorizontal: 16,
          marginTop: insets.top + 16,
          overflow: 'hidden',
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 4,
        }}
      >
        {/* Status / Tracking Line */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isDone ? '#10B981' : statusColor }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
              {isDone ? 'Medição clínica concluída' : (!isTracking ? 'Mapeando ambiente...' : cfg.statusText)}
            </Text>
          </View>
          {isDone ? (
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10B981' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}>
                {CLINICAL_STEPS.length} / {CLINICAL_STEPS.length} ✓
              </Text>
            </View>
          ) : (
            cfg.badgeLabel && (
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(2, 132, 199, 0.12)', borderWidth: 1, borderColor: 'rgba(2, 132, 199, 0.4)' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#0284C7' }}>{cfg.badgeLabel}</Text>
              </View>
            )
          )}
        </View>

        {/* Step details & instruction cue — Clean Clinical Typography, No Emojis */}
        {!isDone && currentStepLabel && (
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: '#0284C7', textTransform: 'uppercase' }}>
              ETAPA {savedCount + 1} DE {CLINICAL_STEPS.length}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A', letterSpacing: -0.3 }}>
              {currentStepLabel}
            </Text>
            {instruction && (
              <View style={{ marginTop: 8, backgroundColor: 'rgba(255, 255, 255, 0.65)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Text style={{ fontSize: 13, fontWeight: '400', color: '#334155', lineHeight: 18 }}>
                  {instruction}
                </Text>
              </View>
            )}
          </View>
        )}
      </BlurView>

      {/* ── Center: Reticle & Glass Target Badge ("PONTO A") ── */}
      {!isDone && (
        <>
          <View style={ui.reticleWrapper} pointerEvents="none">
            <View style={[ui.corner, ui.tl, { borderColor: reticleColor }]} />
            <View style={[ui.corner, ui.tr, { borderColor: reticleColor }]} />
            <View style={[ui.corner, ui.bl, { borderColor: reticleColor }]} />
            <View style={[ui.corner, ui.br, { borderColor: reticleColor }]} />
            <View style={[ui.crossH, { backgroundColor: reticleColor }]} />
            <View style={[ui.crossV, { backgroundColor: reticleColor }]} />
          </View>

          {/* Center Target Badge ("PONTO A" / "PONTO B" only — redundant "SALVAR" badge removed) */}
          <View style={ui.phasePillWrapper} pointerEvents="none">
            {phase !== 'hasAB' && (
              <BlurView
                intensity={50}
                tint="light"
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.45)',
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  borderWidth: 1,
                  overflow: 'hidden',
                  shadowColor: '#0F172A',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text style={{ color: '#0F172A', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 }}>
                  {cfg.pillLabel}
                </Text>
              </BlurView>
            )}

            {/* Live distance chip — visible only during rubber-band phase */}
            {phase === 'hasA' && liveDistance !== null && (
              <BlurView
                intensity={50}
                tint="light"
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  paddingHorizontal: 18,
                  paddingVertical: 7,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  borderWidth: 1.5,
                  borderColor: '#0284C7',
                  overflow: 'hidden',
                }}
              >
                <Text style={{ color: '#0284C7', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
                  {liveDistance.toFixed(1)}
                </Text>
                <Text style={{ color: '#0284C7', fontSize: 14, fontWeight: '700' }}> cm</Text>
              </BlurView>
            )}
          </View>
        </>
      )}

      {/* ── 2. Bottom Floating Action Buttons: Ghost Reset + Clinical Blue Pill ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 16,
          alignItems: 'center',
          gap: 12,
        }}
        pointerEvents="box-none"
      >
        {isDone ? (
          /* Done state: next button */
          <TouchableOpacity
            style={{
              width: '100%',
              height: 56,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#00E5A0',
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
            onPress={onNextStep}
            activeOpacity={0.82}
          >
            <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 }}>
              Medidas Concluídas — Avançar ›
            </Text>
          </TouchableOpacity>
        ) : (
          /* Capture state: clean Ghost reset + floating pill primary action */
          <>
            {savedCount > 0 && (
              <TouchableOpacity
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  backgroundColor: 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={onClear}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '600',
                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 4,
                  }}
                >
                  Reiniciar protocolo
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                {
                  width: '100%',
                  height: 56,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#007AFF',
                  shadowColor: '#007AFF',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 10,
                },
                btnDisabled && { opacity: 0.35 },
              ]}
              onPress={onAction}
              disabled={btnDisabled}
              activeOpacity={0.78}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 }}>
                {cfg.btnLabel}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ARScanner — state container (default export)
// ═══════════════════════════════════════════════════════════════════════════════
export interface ARScannerProps {
  scanId?: string;
  patientName?: string;
  region?: string;
  side?: string;
}

export default function ARScanner({
  scanId,
  patientName,
  region,
  side,
}: ARScannerProps = {}) {
  const router = useRouter();

  const [trackingState, setTrackingState] = useState(0);
  const [pointA, setPointA]               = useState<Vec3 | null>(null);
  const [pointB, setPointB]               = useState<Vec3 | null>(null);
  const [stepIndex, setStepIndex]         = useState(0);
  const [clinicalData, setClinicalData]   = useState<Record<string, number>>({});

  // ── Rubber-band live measurement ──────────────────────────────────────────
  // dynamicPoint feeds the 3-D scene; liveDistance feeds the RN overlay.
  // Both are updated at ~15 fps to avoid bridge saturation.
  const [liveDistance,  setLiveDistance]  = useState<number | null>(null);
  const [dynamicPoint,  setDynamicPoint]  = useState<Vec3 | null>(null);

  // Refs that mirror pointA/pointB state so handleHitTest stays dep-free
  // (it lives in passProps — must never be recreated)
  const pointARef       = useRef<Vec3 | null>(null);
  const pointBRef       = useRef<Vec3 | null>(null);
  const lastUpdateRef   = useRef<number>(0);

  // Latest hit position — ref only, no re-renders
  const hitRef = useRef<Vec3 | null>(null);

  // Keep refs in sync with state on every render (synchronous, no effect needed)
  pointARef.current = pointA;
  pointBRef.current = pointB;

  const isTracking = trackingState === 3;
  const phase: Phase = !pointA ? 'idle' : !pointB ? 'hasA' : 'hasAB';
  const isDone = stepIndex >= CLINICAL_STEPS.length;

  // ── Stable callbacks (safe in passProps) ─────────────────────────────────

  const handleTrackingUpdated = useCallback(
    (state: number) => setTrackingState(state), [],
  );

  // Direct hit-test handler bound to <ViroARScene onCameraARHitTest>.
  // IMPORTANT: deps array is empty [] so this callback is created once and
  // never changes — safe to pass via passProps without remounting the scene.
  // pointA / pointB are read via refs (pointARef / pointBRef) instead of
  // closing over state, which would force recreation on every render.
  const handleHitTest = useCallback((event: any) => {
    // Normalise across @reactvision/react-viro build variants
    const hits: any[] =
      Array.isArray(event)                 ? event                :
      Array.isArray(event?.hitTestResults) ? event.hitTestResults :
      Array.isArray(event?.results)        ? event.results        :
      [];

    if (hits.length === 0) return;

    const raw = hits[0];
    const pos: any =
      raw?.transform?.position ??
      raw?.worldTransform?.position ??
      raw?.position;

    if (!Array.isArray(pos) || pos.length !== 3) return;

    const currentPos: Vec3 = [pos[0], pos[1], pos[2]];
    hitRef.current = currentPos; // always update the click-target ref

    const pA = pointARef.current;
    const pB = pointBRef.current;

    if (pA && !pB) {
      // ── Rubber-band phase: throttle 3-D + UI updates to ~15 fps ────────
      const now = Date.now();
      if (now - lastUpdateRef.current > 65) {
        lastUpdateRef.current = now;

        const dx = currentPos[0] - pA[0];
        const dy = currentPos[1] - pA[1];
        const dz = currentPos[2] - pA[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) * 100;

        setDynamicPoint(currentPos); // drives the 3-D rubber-band line
        setLiveDistance(dist);       // drives the RN distance chip
      }
    } else {
      // idle or hasAB — clear rubber-band state (cheap no-op if already null)
      if (dynamicPoint !== null) setDynamicPoint(null);
      if (liveDistance !== null) setLiveDistance(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — reads live values via refs

  // ── Action handler ────────────────────────────────────────────────────────

  const handleAction = useCallback(() => {
    // Phase 3 — save the current step's measurement and advance the protocol
    if (pointA && pointB) {
      if (isDone) return; // all steps already captured, no-op

      const dx = pointB[0] - pointA[0];
      const dy = pointB[1] - pointA[1];
      const dz = pointB[2] - pointA[2];
      const value = Math.sqrt(dx * dx + dy * dy + dz * dz) * 100;

      const currentStep = CLINICAL_STEPS[stepIndex];
      setClinicalData(prev => ({ ...prev, [currentStep.key]: value }));
      setStepIndex(prev => prev + 1);
      setPointA(null);
      setPointB(null);
      return;
    }

    // Phase 1 & 2 — need a surface hit
    if (!hitRef.current) {
      Alert.alert(
        'Superficie nao detectada',
        'Mova a camera lentamente sobre uma superficie plana.',
      );
      return;
    }

    const pos = [...hitRef.current] as Vec3;
    if (!pointA) setPointA(pos);
    else         setPointB(pos);
  }, [pointA, pointB, stepIndex, isDone]);

  // Resets the entire clinical protocol from scratch
  const handleClear = useCallback(() => {
    setClinicalData({});
    setStepIndex(0);
    setPointA(null);
    setPointB(null);
    setDynamicPoint(null);
    setLiveDistance(null);
    hitRef.current     = null;
    lastUpdateRef.current = 0;
  }, []);

  // ── Next-step transition — navigate to processing with captured dimensions ───
  const handleNextStep = useCallback(() => {
    router.push({
      pathname: '/processing',
      params: {
        id: scanId,
        patientName,
        region,
        side,
        dimensions: JSON.stringify(clinicalData),
      },
    });
  }, [clinicalData, router, scanId, patientName, region, side]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>

      <ViroARSceneNavigator
        autofocus
        initialScene={{
          scene: ClinicalARScene as any,
          // passProps: stable callbacks only — safe since they have no state deps
          passProps: {
            onHitTest:         handleHitTest,
            onTrackingUpdated: handleTrackingUpdated,
          },
        } as any}
        // viroAppProps: reactive state that re-injects on every render
        viroAppProps={{ pointA, pointB, dynamicTarget: dynamicPoint }}
        style={StyleSheet.absoluteFill}
      />

      <ScannerUI
        isTracking={isTracking}
        phase={phase}
        currentStepLabel={CLINICAL_STEPS[stepIndex]?.label}
        instruction={CLINICAL_STEPS[stepIndex]?.instruction}
        clinicalData={clinicalData}
        liveDistance={liveDistance}
        isDone={isDone}
        onAction={handleAction}
        onClear={handleClear}
        onNextStep={handleNextStep}
      />

    </View>
  );
}

// ─── UI Styles ────────────────────────────────────────────────────────────────
const ui = StyleSheet.create({
  overlay: { elevation: 100, zIndex: 100 },

  // Status bar
  statusBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 20, marginHorizontal: 10, paddingHorizontal: 16, paddingVertical: 11,
    backgroundColor: 'rgba(10,14,23,0.78)', borderRadius: 10,
  },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },

  // Shared pill (badge + phase pill base)
  pill: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1.5,
    backgroundColor: 'rgba(10,14,23,0.62)',
  },
  pillText:   { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  // Phase pill overrides (larger variant)
  pillLg:     { paddingHorizontal: 14, paddingVertical: 5 },
  pillLgText: { fontWeight: '800', letterSpacing: 1.2 },

  // Current step label card
  stepLabelCard: {
    marginTop: 6, marginHorizontal: 10,
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.45)',
    gap: 8,
  },
  stepLabelMeta: {
    color: '#A78BFA', fontSize: 9, fontWeight: '800',
    letterSpacing: 1.4, textTransform: 'uppercase',
  },
  stepLabelText: {
    color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3,
  },

  // Contextual anatomical instruction (inside step label card)
  instructionCard: {
    backgroundColor: 'rgba(10,14,23,0.55)',
    borderRadius: 7, paddingHorizontal: 12, paddingVertical: 8,
    borderLeftWidth: 3, borderLeftColor: '#A78BFA',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.80)', fontSize: 12, fontWeight: '500',
    lineHeight: 18, letterSpacing: 0.15,
  },

  // Measurement log
  logCard: {
    marginTop: 6, marginHorizontal: 10,
    backgroundColor: 'rgba(10,14,23,0.82)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.08)',
  },
  logTitle: {
    color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
  },
  logRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 10 },
  logBubble:     { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logBubbleText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  logLabel:      { flex: 1, color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },
  logValue:      { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Reticle
  reticleWrapper: {
    position: 'absolute', top: '50%', left: '50%',
    width: RS, height: RS, marginTop: -(RS / 2), marginLeft: -(RS / 2),
  },
  corner: { position: 'absolute', width: CO, height: CO, borderWidth: TH },
  tl: { top: 0,    left: 0,   borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0,    right: 0,  borderLeftWidth: 0,  borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0,   borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0,  borderLeftWidth: 0,  borderTopWidth: 0 },
  crossH: {
    position: 'absolute', top: '50%', left: '50%',
    width: 14, height: TH, marginTop: -(TH / 2), marginLeft: -7, opacity: 0.85,
  },
  crossV: {
    position: 'absolute', top: '50%', left: '50%',
    width: TH, height: 14, marginTop: -7, marginLeft: -(TH / 2), opacity: 0.85,
  },

  // Phase pill + live-distance chip wrapper
  phasePillWrapper: {
    position: 'absolute', top: '50%', left: 0, right: 0,
    alignItems: 'center', marginTop: RS / 2 + 14,
    gap: 10,
  },

  // Live rubber-band distance chip (shown below the phase pill in hasA phase)
  liveDistChip: {
    flexDirection: 'row', alignItems: 'baseline',
    paddingHorizontal: 18, paddingVertical: 7,
    borderRadius: 22,
    backgroundColor: 'rgba(0,229,160,0.18)',
    borderWidth: 1.5, borderColor: '#00E5A0',
  },
  liveDistValue: {
    color: '#00E5A0', fontSize: 28, fontWeight: '800', letterSpacing: -0.5,
  },
  liveDistUnit: {
    color: '#00E5A0', fontSize: 14, fontWeight: '700',
  },

  // Next-step CTA (done state)
  nextBtn: {
    width: '100%', paddingVertical: 19, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#00E5A0',
    elevation: 12,
    shadowColor: '#00E5A0', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 12,
  },

  // Bottom bar
  bottomSafe: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomBar: {
    alignItems: 'center', gap: 10,
    paddingBottom: 34, paddingTop: 16, paddingHorizontal: 28,
    backgroundColor: 'rgba(10,14,23,0.70)',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  actionBtn: {
    width: '100%', paddingVertical: 17, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  disabled:      { opacity: 0.32 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  clearBtn: {
    paddingVertical: 8, paddingHorizontal: 20,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  clearBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
});
