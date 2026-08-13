"use client";

import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import type { Track } from "@/lib/tracks";
import { getTrackBySlug } from "@/lib/tracks";
import DriftEvolutionScene from "@/components/drift-evolution/DriftEvolutionScene";
import DriftEvolutionFooter from "@/components/drift-evolution/DriftEvolutionFooter";
import Drift3DHud from "@/components/drift-3d/Drift3DHud";
import Drift3DEvidenceProbe from "@/components/drift-3d/Drift3DEvidenceProbe";
import type { Drift3DEvidenceRuntimeRef } from "@/lib/drift3dEvidence";
import {
  DRIFT_3D_CAMERA_MAX_SCALE,
  DRIFT_3D_CAMERA_MIN_SCALE,
  getDrift3DDragDriveInput,
  getDrift3DFollowCameraRig,
  getDrift3DVehicleStartPosition,
  type Drift3DPointerDriveState,
} from "@/lib/drift3d";
import type { Drift3DTopologyProximity } from "@/lib/drift3dTopology";
import {
  createDrift3DVehiclePhysicsState,
  DRIFT_3D_VEHICLE_MAX_SPEED,
  type Drift3DVehiclePhysicsState,
} from "@/lib/drift3dVehiclePhysics";
import {
  Drift3DAmbienceEngine,
  getDrift3DAmbienceMixAt,
} from "@/lib/drift3dAmbience";
import type { Drift3DAudioClockRef } from "@/lib/drift3dAudioClock";
import {
  createDrift3DSceneLifecycleSnapshot,
  transitionDrift3DSceneLifecycle,
  type Drift3DSceneLifecycleSnapshot,
} from "@/lib/drift3dSceneLifecycle";
import {
  getDrift3DCueTimelineIssues,
  resolveDrift3DCueAtTime,
  resolveDrift3DCueFromAudioClock,
  type Drift3DCuePhase,
} from "@/lib/drift3dCueResolver";
import {
  arbitrateDrift3DMajorSignature,
  getDrift3DSignatureCandidateIssues,
  type Drift3DSignatureCandidate,
} from "@/lib/drift3dSignatureArbitration";
import {
  DRIFT_3D_QUALITY_TIERS,
  getDrift3DCanonicalQualityIssues,
  getDrift3DQualityProfile,
  getDrift3DQualityProfileIssues,
  getDrift3DQualityProfileSetIssues,
  isDrift3DQualityTier,
  scaleDrift3DQualityCount,
  scaleDrift3DQualityDimension,
  type Drift3DQualityCapabilities,
  type Drift3DQualityProfileCandidate,
} from "@/lib/drift3dQuality";
import {
  DRIFT_EVOLUTION_MOBILE_MEDIA_QUERY,
  getDriftEvolutionPerformanceProfile,
  hasDriftEvolutionSceneProximityIdentityChanged,
} from "@/lib/driftEvolutionPerformance";

type DriftEvolutionCanvasProps = {
  isCurrentTrack: (track: Track) => boolean;
  isPlaying: boolean;
  toggleTrack: (track: Track) => void;
  currentTrack: Track | null;
  togglePlayback: () => void;
  audioClockRef: Drift3DAudioClockRef;
  evidenceRuntimeRef: Drift3DEvidenceRuntimeRef;
};

export default function DriftEvolutionCanvas({
  isCurrentTrack,
  isPlaying,
  toggleTrack,
  currentTrack,
  togglePlayback,
  audioClockRef,
  evidenceRuntimeRef,
}: DriftEvolutionCanvasProps) {
  const [proximity, setProximity] = useState<Drift3DTopologyProximity | null>(null);
  const [sceneProximity, setSceneProximity] =
    useState<Drift3DTopologyProximity | null>(null);
  const latestProximityRef = useRef<Drift3DTopologyProximity | null>(null);
  const latestCompassBearingRef = useRef(0);
  const sceneProximityRef = useRef<Drift3DTopologyProximity | null>(null);
  const lastProximityRefreshAtRef = useRef(Number.NEGATIVE_INFINITY);
  const proximityRefreshTimeoutRef = useRef<number | null>(null);
  const cameraZoomTargetRef = useRef(1);
  const vehicleStateRef = useRef<Drift3DVehiclePhysicsState>(
    createDrift3DVehiclePhysicsState(getDrift3DVehicleStartPosition(), 0)
  );
  const ambienceEngineRef = useRef<Drift3DAmbienceEngine | null>(null);
  const soundDisabledByUserRef = useRef(false);
  const [isAmbienceOn, setIsAmbienceOn] = useState(false);
  const pointerDriveStateRef = useRef<Drift3DPointerDriveState>({
    active: false,
    pointerId: null,
    origin: null,
    input: { x: 0, z: 0, active: false },
  });
  const activeTouchPointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStateRef = useRef<{ startDistance: number; startScale: number } | null>(null);
  const sceneLifecycleRef = useRef<Drift3DSceneLifecycleSnapshot>(
    createDrift3DSceneLifecycleSnapshot(0)
  );
  const lifecycleEffectGenerationRef = useRef(0);
  const [sceneRuntimeActive, setSceneRuntimeActive] = useState(false);
  const [compassBearingDegrees, setCompassBearingDegrees] = useState(0);
  const [performanceProfile, setPerformanceProfile] = useState(() =>
    getDriftEvolutionPerformanceProfile(
      typeof window !== "undefined" &&
        window.matchMedia(DRIFT_EVOLUTION_MOBILE_MEDIA_QUERY).matches
    )
  );
  const proximityRefreshIntervalMsRef = useRef(
    performanceProfile.proximityRefreshIntervalMs
  );
  const initialCameraRig = useMemo(() => {
    const startPosition = getDrift3DVehicleStartPosition();
    return getDrift3DFollowCameraRig(startPosition, 1);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DRIFT_EVOLUTION_MOBILE_MEDIA_QUERY);
    const syncProfile = () => {
      const nextProfile = getDriftEvolutionPerformanceProfile(mediaQuery.matches);
      proximityRefreshIntervalMsRef.current =
        nextProfile.proximityRefreshIntervalMs;
      setPerformanceProfile(nextProfile);
    };

    syncProfile();
    mediaQuery.addEventListener("change", syncProfile);
    return () => mediaQuery.removeEventListener("change", syncProfile);
  }, []);

  useEffect(() => {
    return () => {
      if (proximityRefreshTimeoutRef.current !== null) {
        window.clearTimeout(proximityRefreshTimeoutRef.current);
        proximityRefreshTimeoutRef.current = null;
      }
    };
  }, []);

  const commitLatestProximity = useCallback(() => {
    proximityRefreshTimeoutRef.current = null;
    const latest = latestProximityRef.current;
    if (!latest) return;
    lastProximityRefreshAtRef.current = performance.now();
    setProximity(latest);
    setCompassBearingDegrees(latestCompassBearingRef.current);
  }, []);

  const handleProximityChange = useCallback(
    (next: Drift3DTopologyProximity) => {
      latestProximityRef.current = next;
      const compassNode = next.activeNode ?? next.nearestNode ?? null;
      if (compassNode) {
        const vehicleState = vehicleStateRef.current;
        const targetHeading = Math.atan2(
          compassNode.position.x - vehicleState.position.x,
          compassNode.position.z - vehicleState.position.z
        );
        const relativeDegrees =
          (targetHeading - vehicleState.heading) * (180 / Math.PI);
        latestCompassBearingRef.current = (relativeDegrees + 360) % 360;
      }

      const previousScene = sceneProximityRef.current;
      const sceneIdentityChanged =
        hasDriftEvolutionSceneProximityIdentityChanged(previousScene, next);

      // The 3D tree only consumes qualitative nearest/active identity. Distance
      // and progress belong to the HUD and must not rebuild every world object.
      if (sceneIdentityChanged) {
        sceneProximityRef.current = next;
        setSceneProximity(next);
      }

      const intervalMs = proximityRefreshIntervalMsRef.current;
      const nowMs = performance.now();
      const elapsedMs = nowMs - lastProximityRefreshAtRef.current;

      if (intervalMs <= 0 || elapsedMs >= intervalMs) {
        if (proximityRefreshTimeoutRef.current !== null) {
          window.clearTimeout(proximityRefreshTimeoutRef.current);
          proximityRefreshTimeoutRef.current = null;
        }
        lastProximityRefreshAtRef.current = nowMs;
        setProximity(next);
        setCompassBearingDegrees(latestCompassBearingRef.current);
        return;
      }

      if (proximityRefreshTimeoutRef.current === null) {
        proximityRefreshTimeoutRef.current = window.setTimeout(
          commitLatestProximity,
          Math.max(0, intervalMs - elapsedMs)
        );
      }
    },
    [commitLatestProximity]
  );

  function setCameraZoomValue(nextZoom: number) {
    const clamped = Math.min(
      Math.max(nextZoom, DRIFT_3D_CAMERA_MIN_SCALE),
      DRIFT_3D_CAMERA_MAX_SCALE
    );
    if (Math.abs(clamped - cameraZoomTargetRef.current) < 0.001) return;
    cameraZoomTargetRef.current = clamped;
  }

  function handleWheelCapture(event: ReactWheelEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setCameraZoomValue(cameraZoomTargetRef.current + event.deltaY * 0.0011);
  }

  useEffect(() => {
    if (!isAmbienceOn) return;
    const engine = ambienceEngineRef.current;
    if (!engine) return;
    const interval = window.setInterval(() => {
      const normalizedSpeed =
        Math.abs(vehicleStateRef.current.speed) / DRIFT_3D_VEHICLE_MAX_SPEED;
      engine.setMix(
        getDrift3DAmbienceMixAt(vehicleStateRef.current.position),
        isPlaying ? 0.045 : 0.13
      );
      engine.setVehicleSpeed(normalizedSpeed);
    }, 280);
    return () => window.clearInterval(interval);
  }, [isAmbienceOn, isPlaying]);

  const startAmbience = useCallback(() => {
    const runningEngine = ambienceEngineRef.current;
    if (runningEngine) {
      setIsAmbienceOn(true);
      return;
    }

    const engine = new Drift3DAmbienceEngine();
    engine.start();
    engine.setMix(
      getDrift3DAmbienceMixAt(vehicleStateRef.current.position),
      isPlaying ? 0.045 : 0.13
    );
    engine.setVehicleSpeed(
      Math.abs(vehicleStateRef.current.speed) / DRIFT_3D_VEHICLE_MAX_SPEED
    );
    ambienceEngineRef.current = engine;
    setIsAmbienceOn(true);
  }, [isPlaying]);

  useEffect(() => {
    const drivingKeys = new Set([
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "w",
      "a",
      "s",
      "d",
    ]);
    const startSoundOnDrive = (event: KeyboardEvent) => {
      if (
        !soundDisabledByUserRef.current &&
        drivingKeys.has(event.key.toLowerCase())
      ) {
        startAmbience();
      }
    };

    window.addEventListener("keydown", startSoundOnDrive);
    return () => window.removeEventListener("keydown", startSoundOnDrive);
  }, [startAmbience]);

  useEffect(() => {
    let cancelled = false;
    const activeTouchPointers = activeTouchPointersRef.current;
    const effectGeneration = ++lifecycleEffectGenerationRef.current;

    sceneLifecycleRef.current = transitionDrift3DSceneLifecycle(
      sceneLifecycleRef.current,
      "mount",
      performance.now()
    );

    if (document.visibilityState === "visible") {
      sceneLifecycleRef.current = transitionDrift3DSceneLifecycle(
        sceneLifecycleRef.current,
        "activate",
        performance.now()
      );
      queueMicrotask(() => {
        if (!cancelled) setSceneRuntimeActive(true);
      });
    }

    function onVisibilityChange() {
      const nowMs = performance.now();
      const state = sceneLifecycleRef.current.state;
      if (document.hidden) {
        if (state === "ACTIVE") {
          sceneLifecycleRef.current = transitionDrift3DSceneLifecycle(
            sceneLifecycleRef.current,
            "pause",
            nowMs
          );
          setSceneRuntimeActive(false);
        }
        return;
      }
      if (state === "PAUSED") {
        sceneLifecycleRef.current = transitionDrift3DSceneLifecycle(
          sceneLifecycleRef.current,
          "resume",
          nowMs
        );
        setSceneRuntimeActive(true);
      } else if (state === "IDLE") {
        sceneLifecycleRef.current = transitionDrift3DSceneLifecycle(
          sceneLifecycleRef.current,
          "activate",
          nowMs
        );
        setSceneRuntimeActive(true);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      ambienceEngineRef.current?.stop();
      ambienceEngineRef.current = null;
      pointerDriveStateRef.current = {
        active: false,
        pointerId: null,
        origin: null,
        input: { x: 0, z: 0, active: false },
      };
      activeTouchPointers.clear();
      pinchStateRef.current = null;
      queueMicrotask(() => {
        if (lifecycleEffectGenerationRef.current !== effectGeneration) return;
        sceneLifecycleRef.current = transitionDrift3DSceneLifecycle(
          sceneLifecycleRef.current,
          "reset",
          performance.now(),
          "route-unmount"
        );
        sceneLifecycleRef.current = transitionDrift3DSceneLifecycle(
          sceneLifecycleRef.current,
          "reset-complete",
          performance.now()
        );
        sceneLifecycleRef.current = transitionDrift3DSceneLifecycle(
          sceneLifecycleRef.current,
          "unmount",
          performance.now()
        );
      });
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const probe = Object.freeze({
      validate: (phases: readonly Drift3DCuePhase[]) => getDrift3DCueTimelineIssues(phases),
      resolveAt: (
        phases: readonly Drift3DCuePhase[],
        timeSeconds: number,
        durationSeconds: number,
        timelineRevision?: number
      ) => ({
        ...resolveDrift3DCueAtTime(phases, timeSeconds, durationSeconds),
        timelineRevision: timelineRevision ?? null,
      }),
      resolveCurrent: (phases: readonly Drift3DCuePhase[]) =>
        resolveDrift3DCueFromAudioClock(
          phases,
          audioClockRef.current,
          performance.now()
        ),
    });
    Object.defineProperty(window, "__drift3dCueResolver", { configurable: true, value: probe });
    return () => {
      if ((window as unknown as Record<string, unknown>).__drift3dCueResolver === probe) {
        delete (window as unknown as Record<string, unknown>).__drift3dCueResolver;
      }
    };
  }, [audioClockRef]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const probe = Object.freeze({
      validate: (candidates: readonly Drift3DSignatureCandidate[]) =>
        getDrift3DSignatureCandidateIssues(candidates),
      arbitrate: (candidates: readonly Drift3DSignatureCandidate[]) =>
        arbitrateDrift3DMajorSignature(candidates),
    });
    Object.defineProperty(window, "__drift3dSignatureArbitration", {
      configurable: true,
      value: probe,
    });
    return () => {
      if (
        (window as unknown as Record<string, unknown>).__drift3dSignatureArbitration === probe
      ) {
        delete (window as unknown as Record<string, unknown>).__drift3dSignatureArbitration;
      }
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const probe = Object.freeze({
      tiers: DRIFT_3D_QUALITY_TIERS,
      getProfile: (tier: string) =>
        isDrift3DQualityTier(tier) ? getDrift3DQualityProfile(tier) : null,
      validate: (profile: Drift3DQualityProfileCandidate) =>
        getDrift3DQualityProfileIssues(profile),
      validateCanonical: () => getDrift3DCanonicalQualityIssues(),
      validateSet: (profiles: readonly Drift3DQualityProfileCandidate[]) =>
        getDrift3DQualityProfileSetIssues(profiles),
      scaleCount: (
        baseCount: number,
        tier: string,
        capability: keyof Drift3DQualityCapabilities,
        minimumCount?: number
      ) => {
        if (!isDrift3DQualityTier(tier)) return null;
        const profile = getDrift3DQualityProfile(tier);
        return scaleDrift3DQualityCount(
          baseCount,
          profile.capabilities[capability],
          minimumCount
        );
      },
      scaleDimension: (
        baseDimension: number,
        tier: string,
        capability: keyof Drift3DQualityCapabilities,
        minimumDimension?: number
      ) => {
        if (!isDrift3DQualityTier(tier)) return null;
        const profile = getDrift3DQualityProfile(tier);
        return scaleDrift3DQualityDimension(
          baseDimension,
          profile.capabilities[capability],
          minimumDimension
        );
      },
    });
    Object.defineProperty(window, "__drift3dQuality", { configurable: true, value: probe });
    return () => {
      if ((window as unknown as Record<string, unknown>).__drift3dQuality === probe) {
        delete (window as unknown as Record<string, unknown>).__drift3dQuality;
      }
    };
  }, []);

  function toggleAmbience() {
    if (isAmbienceOn) {
      soundDisabledByUserRef.current = true;
      ambienceEngineRef.current?.stop();
      ambienceEngineRef.current = null;
      setIsAmbienceOn(false);
      return;
    }
    soundDisabledByUserRef.current = false;
    startAmbience();
  }

  useEffect(() => {
    function releasePointerDriveState() {
      activeTouchPointersRef.current.clear();
      pinchStateRef.current = null;
      const pointerDriveState = pointerDriveStateRef.current;
      if (
        !pointerDriveState.active &&
        !pointerDriveState.input.active &&
        pointerDriveState.pointerId === null &&
        pointerDriveState.origin === null
      ) return;
      pointerDriveStateRef.current = {
        active: false,
        pointerId: null,
        origin: null,
        input: { x: 0, z: 0, active: false },
      };
    }
    window.addEventListener("blur", releasePointerDriveState);
    document.addEventListener("visibilitychange", releasePointerDriveState);
    return () => {
      window.removeEventListener("blur", releasePointerDriveState);
      document.removeEventListener("visibilitychange", releasePointerDriveState);
    };
  }, []);

  function setPointerDriveInput(pointerId: number, clientX: number, clientY: number) {
    const pointerDriveState = pointerDriveStateRef.current;
    if (pointerDriveState.pointerId !== pointerId || !pointerDriveState.origin) return;
    const nextInput = getDrift3DDragDriveInput(pointerDriveState.origin, {
      x: clientX,
      y: clientY,
    });
    const nextState: Drift3DPointerDriveState = {
      active: nextInput.active,
      pointerId,
      origin: pointerDriveState.origin,
      input: nextInput.active ? nextInput : { x: 0, z: 0, active: false },
    };
    const changed =
      nextState.active !== pointerDriveState.active ||
      nextState.input.active !== pointerDriveState.input.active ||
      Math.abs(nextState.input.x - pointerDriveState.input.x) > 0.001 ||
      Math.abs(nextState.input.z - pointerDriveState.input.z) > 0.001;
    if (changed) pointerDriveStateRef.current = nextState;
  }

  function clearPointerDriveInput(pointerId?: number) {
    const pointerDriveState = pointerDriveStateRef.current;
    if (
      pointerId !== undefined &&
      pointerDriveState.pointerId !== null &&
      pointerDriveState.pointerId !== pointerId
    ) return;
    if (
      !pointerDriveState.active &&
      !pointerDriveState.input.active &&
      pointerDriveState.pointerId === null &&
      pointerDriveState.origin === null
    ) return;
    pointerDriveStateRef.current = {
      active: false,
      pointerId: null,
      origin: null,
      input: { x: 0, z: 0, active: false },
    };
  }

  function getActiveTouchDistance() {
    const points = Array.from(activeTouchPointersRef.current.values());
    if (points.length < 2) return 0;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  function enterPinchMode() {
    clearPointerDriveInput();
    pinchStateRef.current = {
      startDistance: getActiveTouchDistance(),
      startScale: cameraZoomTargetRef.current,
    };
  }

  function exitPinchMode() {
    pinchStateRef.current = null;
    clearPointerDriveInput();
    const remaining = Array.from(activeTouchPointersRef.current.entries());
    if (remaining.length === 1) {
      const [pointerId, point] = remaining[0];
      pointerDriveStateRef.current = {
        active: false,
        pointerId,
        origin: { x: point.x, y: point.y },
        input: { x: 0, z: 0, active: false },
      };
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.defaultPrevented) return;
    const isTouch = event.pointerType === "touch";
    if (isTouch) {
      activeTouchPointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      if (activeTouchPointersRef.current.size >= 2) {
        event.preventDefault();
        event.stopPropagation();
        enterPinchMode();
        return;
      }
    } else if (event.button !== 0) return;
    if (pointerDriveStateRef.current.pointerId !== null) return;
    event.preventDefault();
    event.stopPropagation();
    if (!soundDisabledByUserRef.current) {
      startAmbience();
    }
    pointerDriveStateRef.current = {
      active: false,
      pointerId: event.pointerId,
      origin: { x: event.clientX, y: event.clientY },
      input: { x: 0, z: 0, active: false },
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture errors on unsupported or synthetic sequences.
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      const tracked = activeTouchPointersRef.current.get(event.pointerId);
      if (tracked) {
        tracked.x = event.clientX;
        tracked.y = event.clientY;
      }
      if (pinchStateRef.current) {
        event.preventDefault();
        event.stopPropagation();
        const pinch = pinchStateRef.current;
        const distance = getActiveTouchDistance();
        if (pinch.startDistance > 0 && distance > 0) {
          setCameraZoomValue(pinch.startScale * (pinch.startDistance / distance));
        }
        return;
      }
    }
    if (pointerDriveStateRef.current.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    setPointerDriveInput(event.pointerId, event.clientX, event.clientY);
  }

  function releasePointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      activeTouchPointersRef.current.delete(event.pointerId);
      if (pinchStateRef.current && activeTouchPointersRef.current.size < 2) {
        event.preventDefault();
        event.stopPropagation();
        exitPinchMode();
        return;
      }
    }
    if (pointerDriveStateRef.current.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture errors on unsupported or synthetic sequences.
    }
    clearPointerDriveInput(event.pointerId);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    releasePointer(event);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    releasePointer(event);
  }

  function handleClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  const activeTrack = useMemo(() => {
    if (!proximity?.activeNode || !("trackSlug" in proximity.activeNode)) return null;
    return getTrackBySlug(proximity.activeNode.trackSlug) ?? null;
  }, [proximity]);
  const isActiveTrackCurrent = activeTrack ? isCurrentTrack(activeTrack) : false;
  const isActiveTrackPlaying = isActiveTrackCurrent && isPlaying;

  function handleToggleActiveTrack() {
    if (activeTrack) toggleTrack(activeTrack);
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#08090d]">
      <section
        className="pointer-events-auto absolute inset-0"
        aria-label="Drift listening world"
        aria-describedby="drift-3d-description"
      >
        <Canvas
          className="absolute inset-0"
          camera={{
            position: [
              initialCameraRig.position.x,
              initialCameraRig.position.y,
              initialCameraRig.position.z,
            ],
            fov: 28,
            near: 0.1,
            far: 200,
          }}
          dpr={[1, performanceProfile.maxDpr]}
          frameloop={sceneRuntimeActive ? "always" : "never"}
          shadows={performanceProfile.shadows}
          gl={{
            antialias: performanceProfile.antialias,
            alpha: performanceProfile.alpha,
            powerPreference: "high-performance",
            toneMapping: ACESFilmicToneMapping,
          }}
        >
          <DriftEvolutionScene
            performanceProfile={performanceProfile}
            proximity={sceneProximity}
            onProximityChange={handleProximityChange}
            pointerDriveStateRef={pointerDriveStateRef}
            cameraZoomTargetRef={cameraZoomTargetRef}
            vehicleStateRef={vehicleStateRef}
            audioClockRef={audioClockRef}
            sceneLifecycleRef={sceneLifecycleRef}
          />
          {process.env.NODE_ENV !== "production" ? (
            <Drift3DEvidenceProbe runtimeRef={evidenceRuntimeRef} />
          ) : null}
        </Canvas>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 60%, rgba(8,8,12,0.3) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-[5] ${
            performanceProfile.mode === "mobile"
              ? "opacity-[0.025]"
              : "opacity-[0.035]"
          }`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 touch-none cursor-grab select-none"
          onPointerDownCapture={handlePointerDown}
          onPointerMoveCapture={handlePointerMove}
          onPointerUpCapture={handlePointerUp}
          onPointerCancelCapture={handlePointerCancel}
          onWheelCapture={handleWheelCapture}
          onClickCapture={handleClickCapture}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        />
      </section>

      <div className="pointer-events-none absolute right-[calc(1rem+env(safe-area-inset-right))] top-[calc(1rem+env(safe-area-inset-top))] z-20 w-[min(72vw,18rem)] md:right-6 md:top-6 md:w-[19rem]">
        <div className="pointer-events-auto">
          <Drift3DHud
            proximity={proximity}
            activeTrack={activeTrack}
            isActiveTrackCurrent={isActiveTrackCurrent}
            isActiveTrackPlaying={isActiveTrackPlaying}
            onToggleActiveTrack={handleToggleActiveTrack}
            bearingDegrees={compassBearingDegrees}
          />
        </div>
      </div>

      <DriftEvolutionFooter
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isAmbienceOn={isAmbienceOn}
        onTogglePlayback={togglePlayback}
        onToggleAmbience={toggleAmbience}
      />
    </div>
  );
}
