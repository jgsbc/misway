"use client";

import DriftEvolutionRuntimeClient from "@/components/drift-evolution/DriftEvolutionRuntimeClient";

/**
 * Copy-on-write entrypoint for the evolving world.
 *
 * Production `/drift` stays on its protected runtime. Evolution owns its
 * orchestration layer so scene experiments cannot silently leak back into
 * the artwork baseline.
 */
export default function DriftEvolutionClient() {
  return <DriftEvolutionRuntimeClient />;
}
