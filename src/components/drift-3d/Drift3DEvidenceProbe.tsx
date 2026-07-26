"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Drift3DEvidenceRuntimeRef } from "@/lib/drift3dEvidence";

type Drift3DEvidenceProbeProps = {
  runtimeRef: Drift3DEvidenceRuntimeRef;
};

/**
 * Dev/inspection-only R3F probe (DRIFT-IV-SYS-70). Reads the same renderer
 * stats as the pre-existing `__drift3dRender` global
 * (`gl.info.render.calls`/`triangles`) independently, through its own
 * `useFrame` — it does not read from or depend on `__drift3dRender`, and
 * `__drift3dRender` is not modified by this lot. Every frame it mutates the
 * caller-owned `runtimeRef` in place: no object/array allocation, no
 * `console.*`, no React state, no network, no persistence.
 */
export default function Drift3DEvidenceProbe({
  runtimeRef,
}: Drift3DEvidenceProbeProps) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);

  // Mount/unmount only — this seeds a real initial reading and resets
  // `cumulativeFrameCount` once per real Canvas mount (a deliberate,
  // documented choice; see DRIFT_3D_EVIDENCE_PERFORMANCE_HARNESS_CONTRACT.md).
  // Per-frame updates come from `useFrame` below, not from re-running this
  // effect when `size` changes on resize.
  useEffect(() => {
    const runtimeState = runtimeRef.current;

    runtimeState.canvasPresent = true;
    runtimeState.cumulativeFrameCount = 0;
    runtimeState.drawCalls = gl.info.render.calls;
    runtimeState.triangles = gl.info.render.triangles;
    runtimeState.width = size.width;
    runtimeState.height = size.height;
    runtimeState.dpr = gl.getPixelRatio();

    return () => {
      runtimeState.canvasPresent = false;
      runtimeState.drawCalls = null;
      runtimeState.triangles = null;
      runtimeState.width = null;
      runtimeState.height = null;
      runtimeState.dpr = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeRef]);

  useFrame((state) => {
    const runtimeState = runtimeRef.current;

    runtimeState.cumulativeFrameCount += 1;
    runtimeState.drawCalls = state.gl.info.render.calls;
    runtimeState.triangles = state.gl.info.render.triangles;
    runtimeState.width = state.size.width;
    runtimeState.height = state.size.height;
    runtimeState.dpr = state.gl.getPixelRatio();
  });

  return null;
}
