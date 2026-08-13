export function shouldSuppressIdleAmbientOnDrift({
  isDriftRoute,
  audioKind,
  isActuallyPlaying,
}: {
  isDriftRoute: boolean;
  audioKind: "ambient" | "track";
  isActuallyPlaying: boolean;
}) {
  return isDriftRoute && audioKind === "ambient" && !isActuallyPlaying;
}
