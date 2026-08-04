"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/**
 * IMMERSION CORE — environnement réfléchi.
 *
 * Un ciel analytique éclaire mal les matières : sans carte d'environnement,
 * tout ce qui est métal ou verre rend noir. On préfiltre donc une fois le
 * dôme du monde en carte d'irradiance (technique PMREM standard de
 * three.js), et les vitrages, la ferronnerie, l'eau et la carrosserie
 * reçoivent enfin le ciel qui les entoure.
 *
 * Le monde fournit sa matière de ciel ; le Core ne connaît aucune couleur.
 */
export default function ImmersionEnvironment({
  createSkyMaterial,
  intensity = 1,
}: {
  createSkyMaterial: () => THREE.Material;
  intensity?: number;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const get = useThree((state) => state.get);

  useEffect(() => {
    // La scène est un système externe : on l'écrit via `get()` plutôt que
    // par une capture de rendu.
    const target3d = get().scene;
    void scene;
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();

    const probeScene = new THREE.Scene();
    const material = createSkyMaterial();
    const geometry = new THREE.SphereGeometry(20, 40, 24);
    const dome = new THREE.Mesh(geometry, material);
    probeScene.add(dome);

    // Un sol mat sous le dôme : sans lui, tout reflet vers le bas est noir
    // et les dessous de corniche perdent leur assise.
    const groundGeometry = new THREE.PlaneGeometry(80, 80);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: "#3a3128" });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    probeScene.add(ground);

    const target = pmrem.fromScene(probeScene, 0.05);
    target3d.environment = target.texture;
    target3d.environmentIntensity = intensity;

    return () => {
      target3d.environment = null;
      target.dispose();
      pmrem.dispose();
      geometry.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      material.dispose();
    };
  }, [gl, scene, get, createSkyMaterial, intensity]);

  return null;
}
