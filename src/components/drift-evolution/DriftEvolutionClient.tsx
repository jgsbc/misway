"use client";

import Drift3DClient from "@/components/drift-3d/Drift3DClient";

/**
 * DRIFT Evolution starts as an exact production clone.
 *
 * Copy-on-write rule: this component may diverge, production Drift may not.
 * When an evolution needs a different scene authority, fork only that
 * authority into `drift-evolution/` or `driftEvolution*`; do not edit the
 * production `drift-3d/` / `drift3d*` source just to make the lab change.
 */
export default function DriftEvolutionClient() {
  return <Drift3DClient />;
}
