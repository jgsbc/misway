"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { Drift3DVehicleHandle } from "@/components/drift-3d/Drift3DVehicle";
import { DRIFT_3D_VEHICLE_WHEEL_RADIUS } from "@/components/drift-3d/Drift3DVehicle";
import { getDrift3DHeadingVector } from "@/lib/drift3d";
import {
  createDrift3DVehiclePhysicsState,
  DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
  type Drift3DVehiclePhysicsState,
  type Drift3DVehicleCollider,
} from "@/lib/drift3dVehiclePhysics";
import {
  FABLE_BOUNDS,
  FABLE_SPAWN,
  FABLE_VENTS,
  fableCityMix,
  fableGroundY,
  fableLerp,
  fablePathX,
  fableSmoothstep,
  fableTunnelMix,
  fableYardMix,
} from "@/components/drift-3d/fable/fableWorld";
import type { ImmersionInput } from "@/components/drift-3d/fable/core/immersionInput";
import {
  createImmersionVehicleState,
  stepImmersionVehicle,
} from "@/components/drift-3d/fable/core/immersionVehicle";
import { fableRouteField } from "@/components/drift-3d/fable/fableRoutes";
import { fableEraBlendAt } from "@/components/drift-3d/fable/fableTopology";
import {
  createImmersionExposure,
  stepImmersionExposure,
} from "@/components/drift-3d/fable/core/immersionExposure";
import {
  createImmersionCameraState,
  immersionCameraDesired,
  stepImmersionCamera,
} from "@/components/drift-3d/fable/core/immersionCamera";
import {
  immersionBodySettle,
  immersionContactShadow,
  immersionGroundPose,
} from "@/components/drift-3d/fable/core/immersionGrounding";
import { eventPulse } from "@/components/drift-3d/fable/core/immersionSecondary";
import {
  FABLE_FOG_TUNNEL,
  FABLE_SUN_COLOR,
} from "@/components/drift-3d/fable/FableSky";
import {
  getFableContactShadowTexture,
  getFableSmokeTexture,
} from "@/components/drift-3d/fable/fableTextures";
import type { FablePostUniforms } from "@/components/drift-3d/fable/FablePost";
import type { FableAmbience } from "@/components/drift-3d/fable/fableAudio";

/**
 * FABLE SPIKE — le metteur en scène. Physique du 4x4 (fonctions pures de
 * production), caméra de poursuite basse et inertielle, adaptation lente de
 * l'exposition (l'œil qui s'habitue), brouillard et lumières par zone,
 * poussière des roues, paramètres du voile et de l'ambiance sonore.
 */

type FableDirectorProps = {
  vehicleRef: RefObject<Drift3DVehicleHandle | null>;
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  inputRef: MutableRefObject<ImmersionInput | null>;
  /** Position publiée pour le streamer de régions. */
  vehicleZRef: MutableRefObject<number>;
  vehicleXRef: MutableRefObject<number>;
  colliders: Drift3DVehicleCollider[];
  postUniformsRef: MutableRefObject<FablePostUniforms | null>;
  ambienceRef: MutableRefObject<FableAmbience | null>;
  onFirstMove: () => void;
  reducedMotion: boolean;
};

const DUST_COUNT = 14;

export default function FableDirector({
  vehicleRef,
  vehicleStateRef,
  inputRef,
  vehicleZRef,
  vehicleXRef,
  colliders,
  postUniformsRef,
  ambienceRef,
  onFirstMove,
  reducedMotion,
}: FableDirectorProps) {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);

  const poseRef = useRef({ pitch: 0, roll: 0 });
  /** Facteur de zoom caméra, piloté molette / pincement / stick droit. */
  const zoomRef = useRef(1);
  const vehicleStateExtra = useRef(createImmersionVehicleState());
  // Naissance : l'œil part fermé — la gorge s'ouvre lentement au regard.
  const exposureRef = useRef(createImmersionExposure(1.02));
  const audioClockRef = useRef(0);
  const movedRef = useRef(false);
  const cameraStateRef = useRef(createImmersionCameraState());
  const desiredCamRef = useRef(new THREE.Vector3());
  const prevHeadingRef = useRef(0);
  const contactShadowRef = useRef<THREE.Mesh>(null);

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const sunTargetRef = useRef<THREE.Object3D>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const bounceRef = useRef<THREE.PointLight>(null);
  const beamRef = useRef<THREE.SpotLight>(null);
  const beamTargetRef = useRef<THREE.Object3D>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);

  const dustRef = useRef<THREE.Sprite[]>([]);
  const dustStates = useMemo(
    () =>
      Array.from({ length: DUST_COUNT }, () => ({
        age: 10,
        x: 0,
        y: -10,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
      })),
    []
  );
  const dustCursorRef = useRef(0);
  const dustCooldownRef = useRef(0);

  const fogColor = useMemo(() => new THREE.Color(), []);
  const eraFog = useMemo(() => new THREE.Color(), []);
  const eraSun = useMemo(() => new THREE.Color(), []);
  const eraHemiSky = useMemo(() => new THREE.Color(), []);
  const eraHemiGround = useMemo(() => new THREE.Color(), []);
  const eraSunDir = useMemo(() => new THREE.Vector3(), []);
  const preDawnColor = useMemo(() => new THREE.Color("#6b4c34"), []);

  // Spawn.
  useEffect(() => {
    const startY =
      fableGroundY(FABLE_SPAWN.x, FABLE_SPAWN.z) + DRIFT_3D_VEHICLE_GROUND_CLEARANCE;
    vehicleStateRef.current = createDrift3DVehiclePhysicsState(
      { x: FABLE_SPAWN.x, y: startY, z: FABLE_SPAWN.z },
      0
    );
    vehicleRef.current?.position.set(FABLE_SPAWN.x, startY, FABLE_SPAWN.z);
    vehicleRef.current?.rotation.setY(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sunRef.current && sunTargetRef.current) {
      sunRef.current.target = sunTargetRef.current;
    }

    if (beamRef.current && beamTargetRef.current) {
      beamRef.current.target = beamTargetRef.current;
    }
  }, []);

  useFrame(({ clock }, delta) => {
    const vehicle = vehicleRef.current;
    if (!vehicle) return;

    const state = vehicleStateRef.current;
    const t = clock.elapsedTime;
    const frameDelta = Math.min(delta, 1 / 30);

    /* ── Conduite : le joueur décide de tout ───────────────────────────── */
    const snapshot = inputRef.current?.read(frameDelta) ?? {
      steer: 0,
      throttle: 0,
      brake: 0,
      zoomDelta: 0,
      mode: "keyboard" as const,
      engaged: false,
    };

    if (snapshot.engaged && !movedRef.current) {
      movedRef.current = true;
      onFirstMove();
    }

    zoomRef.current = Math.min(
      2.6,
      Math.max(0.55, zoomRef.current + snapshot.zoomDelta)
    );

    // Surface : la chaussée tient, le hors-piste glisse. Une seule règle
    // pour tout le monde — la difficulté vient du sol, pas de l'ère.
    const surfaceField = fableRouteField(state.position.x, state.position.z);
    const paved = 1 - fableSmoothstep(0.5, 7, surfaceField.distance);

    stepImmersionVehicle(
      state,
      reducedMotion
        ? { steer: 0, throttle: 0, brake: 1 }
        : { steer: snapshot.steer, throttle: snapshot.throttle, brake: snapshot.brake },
      frameDelta,
      FABLE_BOUNDS,
      colliders,
      fableGroundY,
      { paved },
      vehicleStateExtra.current
    );

    // Confinement latéral de la gorge : la roche, pas un rail. Il est
    // borné en x autant qu'en z — sur la péninsule pliée, la corniche
    // ouest redescend dans la même plage de z que la gorge d'Entry.
    if (state.position.z < -3 && Math.abs(state.position.x) < 26) {
      const px = fablePathX(state.position.z);
      const dx = state.position.x - px;
      const limit = 2.75;

      if (Math.abs(dx) > limit) {
        state.position.x = px + Math.sign(dx) * limit;
        state.velocityX *= 0.15;
      }

      if (state.position.z < -57.5) {
        state.position.z = -57.5;
        state.velocityZ = Math.max(0, state.velocityZ);
      }
    }

    vehicleZRef.current = state.position.z;
    vehicleXRef.current = state.position.x;

    /* ── Assiette & ancrage (core) ────────────────────────────────────── */
    const heading = getDrift3DHeadingVector(state.heading);
    const pose = immersionGroundPose(
      state.position.x,
      state.position.z,
      heading.x,
      heading.z,
      fableGroundY,
      state.airborne
    );
    const speedRatio = Math.min(1, Math.abs(state.speed) / 6.4);
    const settle = immersionBodySettle(speedRatio, t);
    const poseEase = Math.min(1, delta * 8);
    poseRef.current.pitch +=
      (pose.pitch + settle.pitchNose - poseRef.current.pitch) * poseEase;
    poseRef.current.roll += (pose.roll - poseRef.current.roll) * poseEase;

    vehicle.position.set(
      state.position.x,
      state.position.y - settle.drop,
      state.position.z
    );
    vehicle.rotation.setY(state.heading);
    vehicle.rotation.setPitch(poseRef.current.pitch);
    vehicle.rotation.setLean(poseRef.current.roll);
    vehicle.setWheelRoll(
      reducedMotion ? 0 : (state.speed * frameDelta) / DRIFT_3D_VEHICLE_WHEEL_RADIUS
    );

    // Ombre de contact : colle au sol, respire avec la garde au sol.
    const shadowMesh = contactShadowRef.current;

    if (shadowMesh) {
      const groundHere = fableGroundY(state.position.x, state.position.z);
      const contact = immersionContactShadow(state.position.y - groundHere - 0.02);
      shadowMesh.position.set(state.position.x, groundHere + 0.075, state.position.z);
      shadowMesh.rotation.z = -state.heading;
      shadowMesh.scale.set(1.35 * contact.scale, 1.75 * contact.scale, 1);
      (shadowMesh.material as THREE.MeshBasicMaterial).opacity = contact.opacity;
    }

    /* ── Zones ────────────────────────────────────────────────────────── */
    const z = state.position.z;
    const tm = fableTunnelMix(z, state.position.x);
    const cm = fableCityMix(z);
    const ym = fableYardMix(z);
    const ledgeMix =
      fableSmoothstep(0.5, 4.5, z) * (1 - fableSmoothstep(14, 24, z));

    /* ── Caméra (core + contraintes du monde) ─────────────────────────── */
    const yawRate =
      frameDelta > 0
        ? (state.heading - prevHeadingRef.current) / frameDelta
        : 0;
    prevHeadingRef.current = state.heading;

    const cameraTargets = {
      subject: new THREE.Vector3(state.position.x, state.position.y, state.position.z),
      headingX: heading.x,
      headingZ: heading.z,
      speedRatio,
      yawRate,
    };
    const cameraParams = {
      distance: (3.2 + (1 - tm) * 0.75 + ledgeMix * 2.6) * zoomRef.current,
      height: (1.02 + (1 - tm) * 0.3 + ledgeMix * 1.7) * (0.55 + zoomRef.current * 0.45),
      lookAhead: 2.9,
      lookHeight: 0.72 + ledgeMix * 0.25,
      fovBase: 52 + tm * 5 - ledgeMix * 6,
      fovSpeedKick: 8,
      shakeAmplitude: reducedMotion ? 0 : 0.03,
      positionDamping: 4.6,
      lookDamping: 6,
      rollGain: 0.022,
    };
    const desired = desiredCamRef.current;
    immersionCameraDesired(cameraTargets, cameraParams, t, desired);

    // Contraintes du monde : la caméra reste dans la gorge, ne retraverse
    // jamais la paroi, ne passe jamais sous le sol.
    if (desired.z < -3) {
      const px = fablePathX(desired.z);
      const camLimit = 2.4;
      const dx = desired.x - px;

      if (Math.abs(dx) > camLimit) desired.x = px + Math.sign(dx) * camLimit;

      desired.y = Math.min(desired.y, fableGroundY(desired.x, desired.z) + 4.1);
    } else if (z > -3 && desired.z < -2.6) {
      desired.z = -2.6;
      desired.x = Math.min(1.3, Math.max(-0.4, desired.x));
      desired.y = Math.min(desired.y, fableGroundY(0.5, -2.6) + 4.6);
    }

    desired.y = Math.max(desired.y, fableGroundY(desired.x, desired.z) + 0.55);

    const perspective = camera as THREE.PerspectiveCamera;
    const fovTarget = stepImmersionCamera(
      perspective,
      cameraStateRef.current,
      desired,
      cameraTargets,
      cameraParams,
      delta
    );

    if (Math.abs(perspective.fov - fovTarget) > 0.05) {
      perspective.fov += (fovTarget - perspective.fov) * Math.min(1, delta * 3);
      perspective.updateProjectionMatrix();
    }

    /* ── Atmosphère : chaque ère apporte son heure ─────────────────────── */
    const { from: eraFrom, to: eraTo, t: eraT } = fableEraBlendAt(state.position.x, z);
    eraFog.copy(eraFrom.fog).lerp(eraTo.fog, eraT);
    eraSun.copy(eraFrom.sunColor).lerp(eraTo.sunColor, eraT);
    eraHemiSky.copy(eraFrom.hemiSky).lerp(eraTo.hemiSky, eraT);
    eraHemiGround.copy(eraFrom.hemiGround).lerp(eraTo.hemiGround, eraT);
    eraSunDir.copy(eraFrom.sunDir).lerp(eraTo.sunDir, eraT).normalize();
    const eraFogDensity = fableLerp(eraFrom.fogDensity, eraTo.fogDensity, eraT);
    const eraSunIntensity = fableLerp(eraFrom.sunIntensity, eraTo.sunIntensity, eraT);
    const eraHemiIntensity = fableLerp(eraFrom.hemiIntensity, eraTo.hemiIntensity, eraT);
    const eraExposure = fableLerp(eraFrom.exposure, eraTo.exposure, eraT);

    /* ── Adaptation lumineuse (core) ──────────────────────────────────── */
    const exposureTarget = eraExposure + tm * 0.55;
    const glare = stepImmersionExposure(exposureRef.current, exposureTarget, delta);
    gl.toneMappingExposure = exposureRef.current.current;

    const post = postUniformsRef.current;

    if (post) {
      post.uTunnel.value = tm;
      // Éblouissement : l'œil encore réglé sur le noir face au plein jour.
      post.uFlash.value = glare * (1 - tm) * 0.72;
    }

    /* ── Brouillard, fond, lumières ───────────────────────────────────── */
    if (scene.fog instanceof THREE.FogExp2) {
      fogColor.copy(eraFog).lerp(FABLE_FOG_TUNNEL, tm);
      // Fausse aube : l'air de la gorge se réchauffe à l'approche de la brèche.
      const dawn = fableSmoothstep(-26, -8, z) * tm;
      fogColor.lerp(preDawnColor, dawn * 0.5);
      scene.fog.color.copy(fogColor);
      scene.fog.density = fableLerp(eraFogDensity, 0.05, tm) + ym * 0.0012;
    }

    if (sunRef.current && sunTargetRef.current) {
      sunRef.current.intensity = eraSunIntensity * (1 - tm * 0.96);
      sunRef.current.color.copy(eraSun);
      sunRef.current.position.set(
        state.position.x + eraSunDir.x * 110,
        Math.max(12, eraSunDir.y * 110),
        state.position.z + eraSunDir.z * 110
      );
      sunTargetRef.current.position.set(state.position.x, 0, state.position.z);
      sunTargetRef.current.updateMatrixWorld();
    }

    if (hemiRef.current) {
      hemiRef.current.intensity = 0.06 + (1 - tm) * eraHemiIntensity;
      hemiRef.current.color.copy(eraHemiSky);
      hemiRef.current.groundColor.copy(eraHemiGround);
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = 0.04 + (1 - tm) * 0.22;
    }

    if (fillRef.current) {
      fillRef.current.intensity = (1 - tm) * 0.72;
      fillRef.current.position.set(
        state.position.x + 30,
        26,
        state.position.z - 40
      );
    }

    if (bounceRef.current) {
      bounceRef.current.intensity = 2.4 * tm;
      bounceRef.current.position.set(
        state.position.x + heading.x * 1.9,
        state.position.y + 0.7,
        state.position.z + heading.z * 1.9
      );
    }

    // Vrais phares — la nappe de lumière qui porte la conduite au crépuscule.
    if (beamRef.current && beamTargetRef.current) {
      beamRef.current.position.set(
        state.position.x + heading.x * 0.7,
        state.position.y + 0.55,
        state.position.z + heading.z * 0.7
      );
      beamTargetRef.current.position.set(
        state.position.x + heading.x * 9,
        state.position.y - 0.5,
        state.position.z + heading.z * 9
      );
      beamTargetRef.current.updateMatrixWorld();
      beamRef.current.intensity = 34 + tm * 36;
    }

    /* ── Poussière des roues ──────────────────────────────────────────── */
    dustCooldownRef.current -= delta;
    const dusty = Math.abs(state.speed) > 2.1 && !state.airborne && !reducedMotion;

    if (dusty && dustCooldownRef.current <= 0) {
      dustCooldownRef.current = 0.09;
      const i = dustCursorRef.current;
      dustCursorRef.current = (i + 1) % DUST_COUNT;
      const s = dustStates[i];
      s.age = 0;
      s.x = state.position.x - heading.x * 0.7 + (Math.random() - 0.5) * 0.5;
      s.y = state.position.y + 0.08;
      s.z = state.position.z - heading.z * 0.7 + (Math.random() - 0.5) * 0.5;
      s.vx = -heading.x * 0.7 + (Math.random() - 0.5) * 0.5;
      s.vy = 0.55 + Math.random() * 0.4;
      s.vz = -heading.z * 0.7 + (Math.random() - 0.5) * 0.5;
    }

    const dustLife = 1.15;

    for (let i = 0; i < DUST_COUNT; i += 1) {
      const s = dustStates[i];
      const sprite = dustRef.current[i];
      if (!sprite) continue;

      s.age += delta;

      if (s.age >= dustLife) {
        (sprite.material as THREE.SpriteMaterial).opacity = 0;
        continue;
      }

      s.x += s.vx * delta;
      s.y += s.vy * delta;
      s.z += s.vz * delta;
      sprite.position.set(s.x, s.y, s.z);
      const grow = 0.35 + s.age * 1.9;
      sprite.scale.set(grow, grow, 1);
      (sprite.material as THREE.SpriteMaterial).opacity =
        (1 - s.age / dustLife) * (0.16 + (1 - tm) * 0.14);
    }

    /* ── Ambiance sonore ──────────────────────────────────────────────── */
    audioClockRef.current -= delta;

    if (audioClockRef.current <= 0) {
      audioClockRef.current = 0.12;

      // Bouche de vapeur la plus proche : sifflement localisé, panoramique.
      let ventNear = 0;
      let ventPan = 0;

      for (const vent of FABLE_VENTS) {
        const dx = vent.x - state.position.x;
        const dz = vent.z - state.position.z;
        const d = Math.hypot(dx, dz);
        const near = Math.max(0, 1 - d / 11);

        if (near > ventNear) {
          ventNear = near;
          ventPan = Math.max(-1, Math.min(1, dx / 6));
        }
      }

      ambienceRef.current?.setParams({
        speed: Math.abs(state.speed),
        tunnel: tm,
        city: cm,
        yard: ym,
        ventNear,
        ventPan,
        // Tension d'amarre : même horloge que l'impulsion visuelle de la cour.
        pulse: eventPulse(t, 77, 38, 2.6) * ym,
      });
    }
  });

  const smoke = getFableSmokeTexture();

  return (
    <>
      <hemisphereLight ref={hemiRef} args={["#9a8c96", "#5c4a35", 0.4]} />
      <ambientLight ref={ambientRef} intensity={0.05} />
      <directionalLight
        ref={sunRef}
        castShadow
        color={FABLE_SUN_COLOR}
        position={[-50, 20, 56]}
        intensity={3}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={46}
        shadow-camera-bottom={-42}
        shadow-camera-near={4}
        shadow-camera-far={220}
        shadow-bias={-0.0004}
      />
      <object3D ref={sunTargetRef} />
      {/* Contre-jour adouci : remplissage chaud-gris depuis l'arrière-caméra. */}
      <directionalLight ref={fillRef} color="#c9a98c" intensity={0.5} />
      {/* Rebond des phares — rend le proche lisible dans le noir. */}
      <pointLight ref={bounceRef} color="#ffd9a6" intensity={0} distance={8} decay={1.8} />
      {/* Nappe des phares projetée sur la route. */}
      <spotLight
        ref={beamRef}
        color="#ffe3b0"
        intensity={34}
        distance={26}
        angle={0.62}
        penumbra={0.65}
        decay={1.7}
      />
      <object3D ref={beamTargetRef} />

      {/* Ombre de contact du 4x4. */}
      <mesh ref={contactShadowRef} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={getFableContactShadowTexture()}
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      </mesh>

      {dustStates.map((_, i) => (
        <sprite
          key={i}
          ref={(sprite) => {
            if (sprite) dustRef.current[i] = sprite;
          }}
          position={[0, -20, 0]}
        >
          <spriteMaterial
            map={smoke}
            color="#b9a789"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </sprite>
      ))}
    </>
  );
}
