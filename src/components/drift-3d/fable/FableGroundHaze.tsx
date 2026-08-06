"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FABLE_REGIONS } from "@/components/drift-3d/fable/fablePeninsula";

/**
 * FABLE — brume de sol locale.
 *
 * Le brouillard de scène est global : une seule densité pour tout le monde.
 * Tant que Birth Yard portait sa densité de port (saturation à 165 m), la
 * rive d'en face — à 274-288 m — s'écrasait en une masse plate. Mais éclaircir
 * le brouillard partout aurait rendu le port générique.
 *
 * On sépare donc les deux échelles. Le brouillard global passe à une portée
 * longue, qui laisse lire la péninsule ; la densité du port revient ici, sous
 * forme de coques verticales concentriques centrées sur la région.
 *
 * Pourquoi des coques et non des nappes horizontales : un regard horizontal
 * ne traverse jamais un plan horizontal. Une coque, si. Depuis le cœur du
 * port on en traverse une douzaine — l'air est épais ; depuis le quai vers le
 * large on n'en traverse que deux ou trois, puis plus rien pendant cent
 * cinquante mètres — la rive d'en face reste lisible.
 *
 * Le rayon vient de la région, pas d'une constante écrite à la main : c'est
 * la même autorité que le terrain et le fond de ville.
 */

const BY = FABLE_REGIONS[1];

const SHELLS = 14;
const INNER = 12;
/** Bornée sous le rayon de la région : la brume s'arrête avec le port. */
const OUTER = BY.radius * 0.94;
/** Hauteur de la nappe : elle noie la rue, pas les grues ni le ciel. */
const TOP = 22;
/**
 * Opacité d'une coque. Le total vient du nombre traversé, pas de celle-ci.
 *
 * Calé sur ce que le brouillard rendait avant : à soixante mètres dans la
 * rue, l'ancienne densité de 0,0105 occultait 33 %. La portée longue n'en
 * donne plus que 6 % ; les six coques traversées depuis le cœur du port
 * rendent le reste. Depuis le quai vers le large on n'en traverse que
 * trois, et leur bord aminci les rend presque nulles — c'est là toute
 * l'asymétrie recherchée.
 */
const SHELL_ALPHA = 0.085;

const vertexShader = /* glsl */ `
  varying float vUp;
  varying vec3 vWorld;

  void main() {
    // 0 au ras du sol, 1 au sommet de la nappe.
    vUp = clamp((position.y + 0.5), 0.0, 1.0);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColour;
  uniform float uAlpha;
  uniform float uWarm;
  varying float vUp;
  varying vec3 vWorld;

  void main() {
    // La brume est un dépôt : épaisse au sol, disparue en hauteur.
    float ground = 1.0 - smoothstep(0.18, 1.0, vUp);
    // Elle se réchauffe près de l'eau et des lampes du quai, sans changer
    // de nature — c'est la même brume, pas une seconde couleur.
    vec3 tint = mix(uColour, uColour * vec3(1.22, 1.06, 0.9), uWarm * (1.0 - vUp));
    float a = uAlpha * ground;

    if (a < 0.002) discard;

    gl_FragColor = vec4(tint, a);
  }
`;

/**
 * Portée de montage : au-delà, les coques sont inutiles et coûteuses. L'audit
 * les a trouvées rendues depuis le cap sud, à deux cents mètres du port —
 * quatorze cylindres transparents de 225 m que personne ne devait voir.
 */
const HAZE_MOUNT_RADIUS = BY.radius + 60;

export default function FableGroundHaze({
  vehicleXRef,
  vehicleZRef,
}: {
  vehicleXRef: React.MutableRefObject<number>;
  vehicleZRef: React.MutableRefObject<number>;
}) {
  const shells = useMemo(() => {
    const list: Array<{ radius: number; alpha: number; order: number }> = [];

    for (let i = 0; i < SHELLS; i += 1) {
      const t = i / (SHELLS - 1);
      // Les coques extérieures s'amincissent : sans cela leur bord se lirait
      // comme un mur cylindrique au lieu d'une limite d'air.
      const fade = 1 - t * t * 0.72;
      list.push({
        radius: INNER + (OUTER - INNER) * t,
        alpha: SHELL_ALPHA * fade,
        // Rendu de l'extérieur vers l'intérieur : l'alpha s'empile proprement.
        order: SHELLS - i,
      });
    }

    return list;
  }, []);

  const uniforms = useMemo(
    () => ({
      uColour: { value: new THREE.Color("#7d7391") },
      uWarm: { value: 0.55 },
    }),
    []
  );

  // Montée seulement quand le port est proche : la brume est un fait local,
  // elle n'a rien à dire depuis l'autre bout de la péninsule.
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = groupRef.current;

    if (!group) return;

    group.visible =
      Math.hypot(vehicleXRef.current - BY.x, vehicleZRef.current - BY.z) <
      HAZE_MOUNT_RADIUS;
  });

  return (
    <group ref={groupRef} position={[BY.x, BY.baseY, BY.z]}>
      {shells.map((shell, i) => (
        <mesh key={i} renderOrder={shell.order} position={[0, TOP * 0.5 - 1.5, 0]}>
          <cylinderGeometry args={[shell.radius, shell.radius, TOP, 40, 1, true]} />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={{ ...uniforms, uAlpha: { value: shell.alpha } }}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.NormalBlending}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}
