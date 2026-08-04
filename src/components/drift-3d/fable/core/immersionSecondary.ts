/**
 * IMMERSION CORE — animation secondaire désynchronisée.
 * Règle : deux éléments visibles ensemble ne partagent jamais fréquence ET
 * phase. Chaque élément dérive les siennes d'une graine stable ; rien ne
 * « respire » à l'unisson sauf décision artistique explicite (événement).
 */

function hash01(seed: number) {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;

  return v - Math.floor(v);
}

/** Phase stable 0..2π dérivée d'une graine. */
export function desyncPhase(seed: number) {
  return hash01(seed) * Math.PI * 2;
}

/** Fréquence stable dans [min,max] dérivée d'une graine. */
export function desyncFrequency(seed: number, min: number, max: number) {
  return min + hash01(seed * 1.61 + 7) * (max - min);
}

/** Balancement doux −1..1, fréquence et phase propres à la graine. */
export function swaySignal(time: number, seed: number, minHz = 0.05, maxHz = 0.22) {
  const f = desyncFrequency(seed, minHz, maxHz) * Math.PI * 2;
  const p = desyncPhase(seed);

  return Math.sin(time * f + p) * 0.7 + Math.sin(time * f * 2.7 + p * 1.9) * 0.3;
}

/**
 * Néon fatigué : 1 la plupart du temps, décrochages brefs et irréguliers.
 * Deux enseignes avec des graines différentes ne clignent jamais ensemble.
 */
export function flickerSignal(time: number, seed: number) {
  const f1 = desyncFrequency(seed, 9, 16);
  const f2 = desyncFrequency(seed * 3.1, 2.1, 4.4);
  const p = desyncPhase(seed);
  const on =
    Math.sin(time * f1 + p) * Math.sin(time * f2 + p * 2.3) > -0.62 &&
    Math.sin(time * 0.9 + p) > -0.85;

  return on ? 1 : 0.24;
}

/** Onde triangulaire 0..1..0 (aller-retour de marcheur). */
export function triWave(t: number) {
  const p = t % 2;

  return p < 1 ? p : 2 - p;
}

/**
 * Événement périodique apériodisé : impulsion 0..1 autour de chaque
 * occurrence, avec période propre à la graine (pour l'anomalie : la tension
 * d'amarre, un grondement…). `width` = durée de l'impulsion en secondes.
 */
export function eventPulse(time: number, seed: number, period: number, width: number) {
  const jitteredPeriod = period * (0.85 + hash01(seed) * 0.3);
  const local = (time + hash01(seed * 2.3) * jitteredPeriod) % jitteredPeriod;
  const d = Math.min(local, jitteredPeriod - local);
  const t = Math.max(0, 1 - d / width);

  return t * t * (3 - 2 * t);
}
