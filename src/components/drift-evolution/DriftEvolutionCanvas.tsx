"use client";

import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import type { Track } from "@/lib/tracks";
import { getTrackBySlug } from "@/lib/tracks";
import DriftEvolutionScene from "@/components/drift-evolution/DriftEvolutionScene";
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
  const cameraZoomTargetRef = useRef(1);
  const vehicleStateRef = useRef<Drift3DVehiclePhysicsState>(
    createDrift3DVehiclePhysicsState(getDrift3DVehicleStartPosition(), 0)
  );
  const ambienceEngineRef = useRef<Drift3DAmbienceEngine | null>(null);
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
  const initialCameraRig = useMemo(() => {
    const startPosition = getDrift3DVehicleStartPosition();
    return getDrift3DFollowCameraRig(startPosition, 1);
  }, []);

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
      engine.setMix(
        getDrift3DAmbienceMixAt(vehicleStateRef.current.position),
        isPlaying ? 0.045 : 0.13
      );
    }, 280);
    return () => window.clearInterval(interval);
  }, [isAmbienceOn, isPlaying]);

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
      ambienceEngineRef.current?.stop();
      ambienceEngineRef.current = null;
      setIsAmbienceOn(false);
      return;
    }
    const engine = new Drift3DAmbienceEngine();
    engine.start();
    engine.setMix(
      getDrift3DAmbienceMixAt(vehicleStateRef.current.position),
      isPlaying ? 0.045 : 0.13
    );
    ambienceEngineRef.current = engine;
    setIsAmbienceOn(true);
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
  const activeNodeTrackSlug =
    proximity?.activeNode && "trackSlug" in proximity.activeNode
      ? proximity.activeNode.trackSlug
      : null;
  const showPersistentAudioChip =
    Boolean(currentTrack) &&
    (!proximity?.isInside || activeNodeTrackSlug !== currentTrack?.slug);

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
          dpr={[1, 1.5]}
          frameloop={sceneRuntimeActive ? "always" : "never"}
          shadows
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: ACESFilmicToneMapping,
          }}
        >
          <DriftEvolutionScene
            proximity={proximity}
            onProximityChange={setProximity}
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
          className="pointer-events-none absolute inset-0 z-[5] opacity-[0.05] mix-blend-overlay"
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

      <div className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-20 md:bottom-6 md:right-6">
        <button
          type="button"
          onClick={toggleAmbience}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerMove={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          className="pointer-events-auto inline-flex min-h-9 min-w-9 items-center justify-center gap-2 rounded-full border border-neutral-400/60 bg-white/30 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-900 backdrop-blur-md transition hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 md:px-3"
          aria-pressed={isAmbienceOn}
          aria-label={isAmbienceOn ? "Couper l'ambiance sonore" : "Activer l'ambiance sonore"}
        >
          {isAmbienceOn ? (
            <Volume2 aria-hidden="true" className="h-4 w-4" strokeWidth={1.6} />
          ) : (
            <VolumeX aria-hidden="true" className="h-4 w-4" strokeWidth={1.6} />
          )}
          <span className="hidden md:inline">
            {isAmbienceOn ? "AMBIANCE ON" : "AMBIANCE OFF"}
          </span>
        </button>
      </div>

      <div className="pointer-events-none absolute right-[calc(1rem+env(safe-area-inset-right))] top-[calc(1rem+env(safe-area-inset-top))] z-20 max-w-[min(58vw,24rem)] md:right-6 md:top-6 md:max-w-[24rem]">
        <div className="pointer-events-auto">
          <Drift3DHud
            proximity={proximity}
            activeTrack={activeTrack}
            isActiveTrackCurrent={isActiveTrackCurrent}
            isActiveTrackPlaying={isActiveTrackPlaying}
            onToggleActiveTrack={handleToggleActiveTrack}
          />
        </div>
      </div>

      {showPersistentAudioChip && currentTrack ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-20 flex justify-center md:inset-x-6 md:bottom-6">
          <div className="pointer-events-auto inline-flex max-w-[min(78vw,24rem)] items-center gap-2.5 rounded-full bg-white/36 px-3 py-2 text-neutral-950 ring-1 ring-black/5 backdrop-blur-md md:gap-3 md:py-2.5">
            <div className="min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-neutral-500">
                {isPlaying ? "NOW PLAYING" : "TRACK HELD"}
              </p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-900">
                {currentTrack.title}
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                togglePlayback();
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerMove={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onPointerCancel={(event) => event.stopPropagation()}
              className="pointer-events-auto inline-flex min-h-8 shrink-0 items-center justify-center rounded-full border border-neutral-300/80 bg-white/72 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              aria-label={isPlaying ? "Pause current track" : "Resume current track"}
            >
              {isPlaying ? "PAUSE" : "RESUME"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
