"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
  findEuxGainentLivingSceneRoot,
  getEuxGainentEvolutionTranslation,
} from "@/lib/driftEvolutionEuxRelocation";

/**
 * Evolution-only presentation bridge. The accepted EUX living scene remains
 * untouched; this moves its entire rendered root as one rigid composition so
 * every authored detail follows the track into New Signal.
 */
export default function EuxGainentEvolutionRelocator() {
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    const root = findEuxGainentLivingSceneRoot(scene);
    if (!root) return;

    const previous = root.position.clone();
    const translation = getEuxGainentEvolutionTranslation();

    root.position.set(
      previous.x + translation.x,
      previous.y + translation.y,
      previous.z + translation.z
    );
    root.updateMatrixWorld(true);

    return () => {
      root.position.copy(previous);
      root.updateMatrixWorld(true);
    };
  }, [scene]);

  return null;
}
