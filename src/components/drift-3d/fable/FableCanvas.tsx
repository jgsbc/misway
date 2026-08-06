"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Drift3DVehicle, {
  type Drift3DVehicleHandle,
} from "@/components/drift-3d/Drift3DVehicle";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import type { ImmersionInput } from "@/components/drift-3d/fable/core/immersionInput";
import FableSky, { createFableSkyMaterial } from "@/components/drift-3d/fable/FableSky";
import ImmersionEnvironment from "@/components/drift-3d/fable/core/ImmersionEnvironment";
import FableTunnel from "@/components/drift-3d/fable/FableTunnel";
import FableCity from "@/components/drift-3d/fable/FableCity";
import FableCanal from "@/components/drift-3d/fable/FableCanal";
import FableFarEras from "@/components/drift-3d/fable/FableFarEras";
import FableGroundHaze from "@/components/drift-3d/fable/FableGroundHaze";
import FableLandmarks from "@/components/drift-3d/fable/FableLandmarks";
import {
  FABLE_BELVEDERE_ROUTE,
  FABLE_HEADLAND_ROUTE,
  FABLE_SUBURB_LOOP,
} from "@/components/drift-3d/fable/fableBranches";
import { FABLE_ERAS } from "@/components/drift-3d/fable/fableTopology";
import FableLife from "@/components/drift-3d/fable/FableLife";
import FableDirector from "@/components/drift-3d/fable/FableDirector";
import FablePost, { type FablePostUniforms } from "@/components/drift-3d/fable/FablePost";
import type { FableAmbience } from "@/components/drift-3d/fable/fableAudio";
import {
  FABLE_SPAWN,
  buildFableWorldLayout,
  fableFarGroundY,
  fableGroundY,
  fablePathX,
} from "@/components/drift-3d/fable/fableWorld";
import { fableBayField, fableRegionAt } from "@/components/drift-3d/fable/fablePeninsula";
import { fableRouteField } from "@/components/drift-3d/fable/fableRoutes";

/**
 * FABLE SPIKE — montage de la scène complète : gorge, ville, vie, véhicule
 * canonique, metteur en scène, voile. Une seule expérience continue.
 */

/**
 * Dev-only : sonde de vérification visuelle. Permet d'avancer la simulation
 * image par image et de capturer le canvas même quand l'onglet est gelé
 * (rAF suspendu). Jamais montée en production.
 */
function FableDebugProbe({
  vehicleStateRef,
  lots,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  lots: Array<{ x: number; z: number; width: number; depth: number; height: number }>;
}) {
  const get = useThree((state) => state.get);

  useEffect(() => {
    let last = performance.now();

    /**
     * Une seule collecte de maillages pour toutes les sondes. Deux listes
     * bâties séparément se contredisent : l'une jurait qu'un pixel montrait
     * l'eau, l'autre une matière standard. La visibilité est héritée, et une
     * InstancedMesh garde la sphère englobante calculée avant que ses
     * matrices soient posées — minuscule, elle fait sortir le raycaster
     * d'emblée. Les deux pièges sont désarmés ici, une fois.
     */
    const collectMeshes = () => {
      const shown = (o: THREE.Object3D) => {
        for (let n: THREE.Object3D | null = o; n; n = n.parent) {
          if (!n.visible) return false;
        }

        return true;
      };
      const meshes: THREE.Object3D[] = [];
      get().scene.traverse((o) => {
        const mesh = o as THREE.Mesh;

        if (!mesh.isMesh || !shown(o)) return;

        const instanced = o as THREE.InstancedMesh;

        if (instanced.isInstancedMesh) instanced.computeBoundingSphere();

        meshes.push(o);
      });

      return meshes;
    };

    /** Lancer depuis la caméra, en coordonnées écran normalisées. */
    const castFromCamera = (ndcX: number, ndcY: number) => {
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), get().camera);
      ray.far = 2000;

      return ray.intersectObjects(collectMeshes(), false);
    };

    const probe = {
      lots: (z0: number, z1: number) =>
        lots
          .filter((lot) => lot.z >= z0 && lot.z <= z1)
          .map((lot) => ({
            x: Math.round(lot.x * 10) / 10,
            z: Math.round(lot.z * 10) / 10,
            w: Math.round(lot.width * 10) / 10,
            h: Math.round(lot.height * 10) / 10,
          })),
      step(frames = 1) {
        const state = get();

        for (let i = 0; i < frames; i += 1) {
          last += 1000 / 60;
          state.advance(last, true);
        }

        return frames;
      },
      state() {
        const s = vehicleStateRef.current;

        return { x: s.position.x, z: s.position.z, speed: s.speed, heading: s.heading };
      },
      teleport(x: number, z: number, heading = 0) {
        const s = vehicleStateRef.current;
        s.position.x = x;
        s.position.z = z;
        s.position.y = fableGroundY(x, z) + 0.05;
        s.heading = heading;
        s.velocityX = 0;
        s.velocityY = 0;
        s.velocityZ = 0;
        s.speed = 0;
        s.airborne = false;

        return true;
      },
      drive(speed: number) {
        const s = vehicleStateRef.current;
        s.speed = speed;

        return true;
      },
      snapshot(width = 512, quality = 0.5) {
        const source = get().gl.domElement;
        const scale = width / source.width;
        const target = document.createElement("canvas");
        target.width = width;
        target.height = Math.round(source.height * scale);
        const ctx = target.getContext("2d")!;
        // Deux images, pas une : le tampon de dessin n'est pas préservé, et
        // lire juste après un changement de scène rendait parfois l'image
        // précédente — assez cohérente pour faire croire à un défaut du
        // monde là où la caméra était mesurée saine.
        probe.step(2);
        ctx.drawImage(source, 0, 0, target.width, target.height);
        const url = target.toDataURL("image/jpeg", quality);
        (window as unknown as Record<string, unknown>).__fableSnap = url;

        return url.length;
      },
      /** Hauteur de la caméra au-dessus du sol — diagnostic du rig. */
      cameraClearance() {
        const cam = get().camera;

        return {
          x: +cam.position.x.toFixed(1),
          y: +cam.position.y.toFixed(2),
          z: +cam.position.z.toFixed(1),
          ground: +fableGroundY(cam.position.x, cam.position.z).toFixed(2),
          clearance: +(
            cam.position.y - fableGroundY(cam.position.x, cam.position.z)
          ).toFixed(2),
        };
      },
      /**
       * Ce qui se trouve sous un pixel donné, en coordonnées écran
       * normalisées (−1..1). Plus fiable qu'un dépointage du rayon central :
       * on vise exactement ce que l'image montre.
       */
      pixelAt(ndcX: number, ndcY: number, count = 4) {
        return castFromCamera(ndcX, ndcY)
          .slice(0, count)
          .map((hit) => {
            const mesh = hit.object as THREE.Mesh;
            const material = Array.isArray(mesh.material)
              ? mesh.material[0]
              : mesh.material;

            return {
              d: +hit.distance.toFixed(1),
              geo: mesh.geometry?.type ?? null,
              mat: material?.type ?? null,
              colour:
                (material as THREE.MeshStandardMaterial)?.color?.getHexString() ?? null,
              fog: (material as THREE.Material & { fog?: boolean })?.fog ?? null,
              at: [
                +hit.point.x.toFixed(1),
                +hit.point.y.toFixed(1),
                +hit.point.z.toFixed(1),
              ],
            };
          });
      },
      /**
       * Valeurs réelles des uniformes de la matière sous un pixel. Une
       * matière peut porter le bon code et ne jamais recevoir ses valeurs :
       * c'est la seule façon de le voir depuis l'extérieur.
       */
      uniformsAt(ndcX: number, ndcY: number) {
        // Même lancer que pixelAt, à la lettre : c'est la seule garantie que
        // les deux sondes parlent bien du même pixel.
        const first = castFromCamera(ndcX, ndcY)[0];

        if (!first) return null;

        const mesh = first.object as THREE.Mesh | undefined;
        const material = Array.isArray(mesh?.material) ? mesh?.material[0] : mesh?.material;
        const shader = material as THREE.ShaderMaterial | undefined;

        if (!shader?.uniforms) return { type: material?.type ?? null, uniforms: null };

        const out: Record<string, unknown> = {};

        for (const [key, entry] of Object.entries(shader.uniforms)) {
          const value = (entry as { value: unknown }).value;

          if (typeof value === "number") out[key] = +value.toFixed(5);
          else if (value instanceof THREE.Color) out[key] = `#${value.getHexString()}`;
          else if (value instanceof THREE.Vector3)
            out[key] = [+value.x.toFixed(2), +value.y.toFixed(2), +value.z.toFixed(2)];
        }

        return { type: material?.type ?? null, distance: +first.distance.toFixed(1), uniforms: out };
      },
      /**
       * Masque les surfaces d'eau, reconnues à un uniforme qui n'appartient
       * qu'à leur shader. Isolation contrôlée : deux sondes qui se
       * contredisent se départagent en faisant disparaître l'une des deux.
       */
      setWaterVisible(on: boolean) {
        let touched = 0;
        get().scene.traverse((o) => {
          const mesh = o as THREE.Mesh;

          if (!mesh.isMesh) return;

          const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          const shader = material as THREE.ShaderMaterial;

          if (!shader?.uniforms?.uDeep) return;

          o.visible = on;
          touched += 1;
        });

        return touched;
      },
      /**
       * Masque tous les maillages d'un type de géométrie donné. Sert au
       * diagnostic : quand une masse n'est identifiée par aucun rayon, la
       * faire disparaître est le seul test qui ne se discute pas.
       */
      setVisible(geoType: string, on: boolean) {
        let touched = 0;
        get().scene.traverse((o) => {
          const sprite = o as THREE.Sprite;
          const mesh = o as THREE.Mesh;
          const match =
            geoType === "Sprite"
              ? sprite.isSprite === true
              : mesh.isMesh && mesh.geometry?.type === geoType;

          if (!match) return;

          o.visible = on;
          touched += 1;
        });

        return touched;
      },
      /** Inventaire des sprites — invisibles au lancer de rayon. */
      sprites() {
        const p = new THREE.Vector3();
        const out: Array<Record<string, unknown>> = [];
        get().scene.traverse((o) => {
          const sprite = o as THREE.Sprite;

          if (!sprite.isSprite) return;

          o.getWorldPosition(p);
          out.push({
            x: +p.x.toFixed(1),
            y: +p.y.toFixed(1),
            z: +p.z.toFixed(1),
            w: +sprite.scale.x.toFixed(1),
            h: +sprite.scale.y.toFixed(1),
            visible: o.visible,
            opacity: (sprite.material as THREE.SpriteMaterial)?.opacity ?? null,
            colour:
              (sprite.material as THREE.SpriteMaterial)?.color?.getHexString() ?? null,
          });
        });

        return out.sort((a, b) => (b.w as number) - (a.w as number)).slice(0, 8);
      },
      /** Brouillard et exposition au point courant — diagnostic d'ambiance. */
      atmosphere() {
        const { scene, gl } = get();
        const fog = scene.fog as THREE.FogExp2 | null;

        return {
          fogColour: fog?.color?.getHexString() ?? null,
          fogDensity: fog ? +fog.density.toFixed(5) : null,
          exposure: +gl.toneMappingExposure.toFixed(3),
        };
      },
      memory() {
        const { gl } = get();

        return {
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
        };
      },
      /** Inventaire d'une zone du monde — sert au contrôle de rendu. */
      inspect(minX: number, maxX: number, minZ: number, maxZ: number) {
        const out: Array<Record<string, unknown>> = [];
        const p = new THREE.Vector3();
        get().scene.traverse((o) => {
          const mesh = o as THREE.Mesh & { isPoints?: boolean; count?: number };

          if (!mesh.isMesh && !mesh.isPoints) return;

          o.getWorldPosition(p);

          if (p.x < minX || p.x > maxX || p.z < minZ || p.z > maxZ) return;

          out.push({
            type: o.type,
            count: mesh.count ?? null,
            x: +p.x.toFixed(1),
            y: +p.y.toFixed(1),
            z: +p.z.toFixed(1),
            visible: o.visible,
            geo: mesh.geometry?.type ?? null,
            mat: Array.isArray(mesh.material)
              ? "array"
              : (mesh.material as THREE.Material)?.type,
          });
        });

        return out;
      },
      /**
       * Inventaire des grands volumes, instance par instance. Sert à auditer
       * ce qui bouche la lecture du monde : on mesure les boîtes, on ne les
       * juge pas à l'œil.
       */
      volumes(minSize = 40) {
        type Volume = {
          kind: string;
          geo: string;
          w: number;
          h: number;
          d: number;
          x: number;
          y: number;
          z: number;
          span: number;
          visible: boolean;
          colour: string | null;
        };
        const out: Volume[] = [];
        const box = new THREE.Box3();
        const size = new THREE.Vector3();
        const centre = new THREE.Vector3();
        const matrix = new THREE.Matrix4();
        const scene = get().scene;
        scene.updateMatrixWorld(true);

        scene.traverse((o) => {
          const mesh = o as THREE.Mesh;

          if (!mesh.isMesh || !mesh.geometry) return;

          mesh.geometry.computeBoundingBox();
          const local = mesh.geometry.boundingBox;

          if (!local) return;

          const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          const colour =
            (material as THREE.MeshStandardMaterial)?.color?.getHexString() ?? null;
          const instanced = mesh as THREE.InstancedMesh;

          const push = (world: THREE.Matrix4, kind: string) => {
            box.copy(local).applyMatrix4(world);
            box.getSize(size);
            box.getCenter(centre);
            const span = Math.max(size.x, size.y, size.z);

            if (span < minSize) return;

            out.push({
              kind,
              geo: mesh.geometry.type,
              w: +size.x.toFixed(1),
              h: +size.y.toFixed(1),
              d: +size.z.toFixed(1),
              x: +centre.x.toFixed(1),
              y: +centre.y.toFixed(1),
              z: +centre.z.toFixed(1),
              span: +span.toFixed(1),
              visible: o.visible,
              colour,
            });
          };

          if (instanced.isInstancedMesh) {
            for (let i = 0; i < instanced.count; i += 1) {
              instanced.getMatrixAt(i, matrix);
              matrix.premultiply(instanced.matrixWorld);
              push(matrix, `instance ${instanced.count}×`);
            }
          } else {
            push(mesh.matrixWorld, "mesh");
          }
        });

        return out.sort((a, b) => b.span - a.span);
      },
      /** Ce que la caméra a droit devant : nomme ce qui bouche la vue. */
      lookAt(count = 6, pitch = 0, yaw = 0) {
        const { camera, scene } = get();
        const ray = new THREE.Raycaster();
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);

        // Dépointage : le rayon central regarde le véhicule, donc vers le
        // bas. Ce qui bouche le haut du cadre lui échappe.
        if (pitch !== 0 || yaw !== 0) {
          const right = new THREE.Vector3()
            .crossVectors(dir, new THREE.Vector3(0, 1, 0))
            .normalize();
          dir
            .applyAxisAngle(right, pitch)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
            .normalize();
        }

        ray.set(camera.position, dir);
        ray.far = 900;
        const matrix = new THREE.Matrix4();
        const box = new THREE.Box3();
        const size = new THREE.Vector3();
        const out: Array<Record<string, unknown>> = [];
        // Les sprites n'ont pas de caméra ici et font planter le raycaster :
        // on ne vise que les maillages, qui sont seuls à boucher la vue.
        // La visibilité est héritée : un groupe masqué garde des enfants dont
        // le drapeau reste vrai. On remonte la chaîne, sinon la sonde accuse
        // des objets que le rendu ne dessine jamais.
        const shown = (o: THREE.Object3D) => {
          for (let n: THREE.Object3D | null = o; n; n = n.parent) {
            if (!n.visible) return false;
          }

          return true;
        };
        const meshes: THREE.Object3D[] = [];
        scene.traverse((o) => {
          if ((o as THREE.Mesh).isMesh && shown(o)) meshes.push(o);
        });

        for (const hit of ray.intersectObjects(meshes, false)) {
          if (out.length >= count) break;

          const mesh = hit.object as THREE.Mesh;

          if (!mesh.isMesh || !mesh.geometry) continue;

          const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          mesh.geometry.computeBoundingBox();
          const local = mesh.geometry.boundingBox;
          const instanced = mesh as THREE.InstancedMesh;

          if (local) {
            if (instanced.isInstancedMesh && hit.instanceId != null) {
              instanced.getMatrixAt(hit.instanceId, matrix);
              matrix.premultiply(instanced.matrixWorld);
            } else {
              matrix.copy(mesh.matrixWorld);
            }

            box.copy(local).applyMatrix4(matrix);
            box.getSize(size);
          } else {
            size.set(0, 0, 0);
          }

          out.push({
            d: +hit.distance.toFixed(1),
            geo: mesh.geometry.type,
            colour: (material as THREE.MeshStandardMaterial)?.color?.getHexString() ?? null,
            w: +size.x.toFixed(1),
            h: +size.y.toFixed(1),
            depth: +size.z.toFixed(1),
            at: [+hit.point.x.toFixed(1), +hit.point.y.toFixed(1), +hit.point.z.toFixed(1)],
          });
        }

        return out;
      },
      read(offset: number, length: number) {
        const url = (window as unknown as Record<string, string>).__fableSnap ?? "";

        return url.slice(offset, offset + length);
      },
    };
    (window as unknown as Record<string, unknown>).__fableProbe = probe;
    (window as unknown as Record<string, unknown>).__fablePathX = fablePathX;
    (window as unknown as Record<string, unknown>).__fableGroundY = fableGroundY;
    (window as unknown as Record<string, unknown>).__fableDiag = (x: number, z: number) => ({
      ground: fableGroundY(x, z),
      far: fableFarGroundY(x, z),
      bay: fableBayField(x, z),
      route: fableRouteField(x, z).distance,
      region: fableRegionAt(x, z).id,
    });
    (window as unknown as Record<string, unknown>).__fableVehicleY = () =>
      vehicleStateRef.current.position.y;
    (window as unknown as Record<string, unknown>).__fableBranches = () => ({
      belvedere: {
        start: FABLE_BELVEDERE_ROUTE[0],
        end: FABLE_BELVEDERE_ROUTE[FABLE_BELVEDERE_ROUTE.length - 1],
      },
      loop: { mid: FABLE_SUBURB_LOOP[Math.floor(FABLE_SUBURB_LOOP.length / 2)] },
      headland: {
        mid: FABLE_HEADLAND_ROUTE[Math.floor(FABLE_HEADLAND_ROUTE.length / 2)],
        end: FABLE_HEADLAND_ROUTE[FABLE_HEADLAND_ROUTE.length - 1],
      },
    });

    return () => {
      delete (window as unknown as Record<string, unknown>).__fableProbe;
    };
  }, [get, vehicleStateRef, lots]);

  return null;
}

export type FableCanvasProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  inputRef: MutableRefObject<ImmersionInput | null>;
  ambienceRef: MutableRefObject<FableAmbience | null>;
  onFirstMove: () => void;
  reducedMotion: boolean;
};

export default function FableCanvas({
  vehicleStateRef,
  inputRef,
  ambienceRef,
  onFirstMove,
  reducedMotion,
}: FableCanvasProps) {
  const vehicleRef = useRef<Drift3DVehicleHandle | null>(null);
  const postUniformsRef = useRef<FablePostUniforms | null>(null);
  const layout = useMemo(() => buildFableWorldLayout(), []);
  const vehicleZRef = useRef(FABLE_SPAWN.z);
  const vehicleXRef = useRef(FABLE_SPAWN.x);

  const spawnY = fableGroundY(FABLE_SPAWN.x, FABLE_SPAWN.z) + 0.02;

  return (
    <Canvas
      className="absolute inset-0"
      camera={{
        position: [FABLE_SPAWN.x, spawnY + 1.3, FABLE_SPAWN.z - 3.6],
        fov: 60,
        near: 0.1,
        far: 1600,
      }}
      dpr={[1, 1.75]}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
    >
      <fogExp2 attach="fog" args={["#05060a", 0.05]} />
      <color attach="background" args={["#05060a"]} />

      <FableSky vehicleZRef={vehicleZRef} vehicleXRef={vehicleXRef} />
      <ImmersionEnvironment createSkyMaterial={createFableSkyMaterial} intensity={0.55} />
      <FableTunnel reducedMotion={reducedMotion} />
      <FableCity lots={layout.lots} reducedMotion={reducedMotion} />
      <FableCanal reducedMotion={reducedMotion} />
      {/* Amers : toujours montés, c'est ce qui fait une seule géographie. */}
      <FableLandmarks vehicleXRef={vehicleXRef} vehicleZRef={vehicleZRef} />
      <FableFarEras
        vehicleZRef={vehicleZRef}
        vehicleXRef={vehicleXRef}
        sunDir={FABLE_ERAS[4].sunDir}
        sunColor={FABLE_ERAS[4].sunColor}
      />
      <FableLife reducedMotion={reducedMotion} />
      {/* Densité d'air propre au port, rendue après le décor pour s'empiler
          par-dessus lui sans jamais toucher au ciel ni à la rive d'en face. */}
      <FableGroundHaze />

      <Drift3DVehicle
        ref={vehicleRef}
        initialPosition={[FABLE_SPAWN.x, spawnY, FABLE_SPAWN.z]}
      />

      <FableDirector
        vehicleRef={vehicleRef}
        vehicleStateRef={vehicleStateRef}
        inputRef={inputRef}
        vehicleZRef={vehicleZRef}
        vehicleXRef={vehicleXRef}
        colliders={layout.colliders}
        postUniformsRef={postUniformsRef}
        ambienceRef={ambienceRef}
        onFirstMove={onFirstMove}
        reducedMotion={reducedMotion}
      />

      <FablePost uniformsRef={postUniformsRef} />

      {process.env.NODE_ENV !== "production" ? (
        <FableDebugProbe vehicleStateRef={vehicleStateRef} lots={layout.lots} />
      ) : null}
    </Canvas>
  );
}
