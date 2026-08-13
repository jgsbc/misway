"use client";

import DriftEvolutionRuntimeClient from "@/components/drift-evolution/DriftEvolutionRuntimeClient";

/**
 * Entrypoint for the owner-approved Evolution runtime promoted to `/drift`.
 *
 * `/drift-evolution` remains a noindex review mirror until a future explicit
 * copy-on-write lot gives it a new experimental responsibility.
 */
export default function DriftEvolutionClient() {
  return <DriftEvolutionRuntimeClient />;
}
