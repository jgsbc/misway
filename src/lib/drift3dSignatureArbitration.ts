/**
 * Generic major-signature arbitration (DRIFT-IV-SYS-30).
 *
 * Framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic and
 * cue-agnostic: it only knows how to pick, among the candidates its caller
 * supplies for this single call, at most one winner. It keeps no module-scope
 * mutable state, no history, no previous-winner memory and no global
 * registry — arbitrating the same candidate list always produces the same
 * result. It does not decide which track is active, does not know any slug,
 * and never touches ordinary life loops (passers-by, machines, traffic,
 * ambient micro-events) — those never become candidates of this service and
 * stay entirely under the responsibility of local scenes. "One major
 * signature at a time" never means "one living behavior at a time".
 */

export type Drift3DSignatureOwnerKind = "active-track" | "world";

export type Drift3DSignatureCandidate<TSignatureId extends string = string> =
  Readonly<{
    id: TSignatureId;
    ownerKind: Drift3DSignatureOwnerKind;
    eligible: boolean;
    priority: number;
  }>;

export type Drift3DSignatureArbitrationResult<
  TSignatureId extends string = string,
> = Readonly<{
  activeSignatureId: TSignatureId | null;
  activeCandidateIndex: number;

  activeOwnerKind: Drift3DSignatureOwnerKind | null;
  activePriority: number | null;

  candidateCount: number;
  eligibleCandidateCount: number;

  decision: "none" | "active-track" | "world";
}>;

export type Drift3DSignatureCandidateIssueType =
  | "empty-id"
  | "duplicate-id"
  | "non-finite-priority"
  | "invalid-owner-kind";

export type Drift3DSignatureCandidateIssue = Readonly<{
  type: Drift3DSignatureCandidateIssueType;
  candidateIndex: number;
  message: string;
}>;

function isDrift3DSignatureOwnerKind(
  value: unknown
): value is Drift3DSignatureOwnerKind {
  return value === "active-track" || value === "world";
}

/**
 * Validates a candidate list: empty/duplicate ids, non-finite priority, and
 * (defensively) an `ownerKind` outside the known set. A negative priority is
 * explicitly allowed — priority is only ever compared relatively, within the
 * same `ownerKind`. Intended for authoring, tests, development and
 * acceptance — the hot arbitration path below assumes an already-validated
 * candidate list and does not re-validate it on every call.
 */
export function getDrift3DSignatureCandidateIssues<
  TSignatureId extends string = string,
>(
  candidates: readonly Drift3DSignatureCandidate<TSignatureId>[]
): readonly Drift3DSignatureCandidateIssue[] {
  const issues: Drift3DSignatureCandidateIssue[] = [];
  const seenIds = new Set<string>();

  candidates.forEach((candidate, index) => {
    if (candidate.id.trim().length === 0) {
      issues.push({
        type: "empty-id",
        candidateIndex: index,
        message: `Candidate at index ${index} has an empty id.`,
      });
    } else if (seenIds.has(candidate.id)) {
      issues.push({
        type: "duplicate-id",
        candidateIndex: index,
        message: `Candidate id "${candidate.id}" is duplicated at index ${index}.`,
      });
    } else {
      seenIds.add(candidate.id);
    }

    if (!Number.isFinite(candidate.priority)) {
      issues.push({
        type: "non-finite-priority",
        candidateIndex: index,
        message: `Candidate "${candidate.id}" at index ${index} has a non-finite priority.`,
      });
    }

    if (!isDrift3DSignatureOwnerKind(candidate.ownerKind)) {
      issues.push({
        type: "invalid-owner-kind",
        candidateIndex: index,
        message: `Candidate "${candidate.id}" at index ${index} has an invalid ownerKind.`,
      });
    }
  });

  return issues;
}

/**
 * Canonical order, applied in a single O(n) pass, never sorting or mutating
 * the input array:
 *
 *   1. an ineligible candidate is ignored outright;
 *   2. among eligible candidates, `"active-track"` always beats `"world"`,
 *      regardless of priority;
 *   3. at equal `ownerKind`, the higher `priority` wins;
 *   4. at equal `ownerKind` and `priority`, the lexicographically smaller
 *      `id` wins — compared by UTF-16 code unit (`<`/`>`), never
 *      `localeCompare`, so the result never depends on system locale.
 */
function isDrift3DSignatureCandidateBetter<TSignatureId extends string>(
  candidate: Drift3DSignatureCandidate<TSignatureId>,
  currentBest: Drift3DSignatureCandidate<TSignatureId>
): boolean {
  const candidateIsActiveTrack = candidate.ownerKind === "active-track";
  const bestIsActiveTrack = currentBest.ownerKind === "active-track";

  if (candidateIsActiveTrack !== bestIsActiveTrack) {
    return candidateIsActiveTrack;
  }

  if (candidate.priority !== currentBest.priority) {
    return candidate.priority > currentBest.priority;
  }

  return candidate.id < currentBest.id;
}

/**
 * Pure: resolving the same candidate list always yields the same winner (or
 * no winner). No previous winner, activation history, seen-signature set or
 * transition progress is kept between calls — the canonical way to "clear"
 * an active signature is simply to call this again with an empty list, or
 * with every candidate `eligible: false`.
 */
export function arbitrateDrift3DMajorSignature<
  TSignatureId extends string = string,
>(
  candidates: readonly Drift3DSignatureCandidate<TSignatureId>[]
): Drift3DSignatureArbitrationResult<TSignatureId> {
  let eligibleCandidateCount = 0;
  let bestIndex = -1;
  let best: Drift3DSignatureCandidate<TSignatureId> | null = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];

    if (!candidate.eligible) {
      continue;
    }

    eligibleCandidateCount += 1;

    if (best === null || isDrift3DSignatureCandidateBetter(candidate, best)) {
      best = candidate;
      bestIndex = index;
    }
  }

  if (best === null) {
    return {
      activeSignatureId: null,
      activeCandidateIndex: -1,
      activeOwnerKind: null,
      activePriority: null,
      candidateCount: candidates.length,
      eligibleCandidateCount,
      decision: "none",
    };
  }

  return {
    activeSignatureId: best.id,
    activeCandidateIndex: bestIndex,
    activeOwnerKind: best.ownerKind,
    activePriority: best.priority,
    candidateCount: candidates.length,
    eligibleCandidateCount,
    decision: best.ownerKind,
  };
}
