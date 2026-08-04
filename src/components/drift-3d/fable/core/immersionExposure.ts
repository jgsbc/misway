/**
 * IMMERSION CORE — adaptation lumineuse de l'œil.
 * L'exposition ne saute jamais vers sa cible : elle s'y traîne, avec une
 * asymétrie physiologique. S'habituer au NOIR est lent (l'exposition monte
 * doucement — les détails émergent du noir). Revenir à la LUMIÈRE est plus
 * rapide mais laisse un éblouissement tant que l'œil est sur-réglé.
 */

export type ImmersionExposureState = {
  current: number;
};

export type ImmersionExposureParams = {
  /** Vitesse (1/s) d'ouverture de l'œil quand la cible est plus haute (vers le noir). */
  darkAdaptRate: number;
  /** Vitesse (1/s) de fermeture quand la cible est plus basse (vers la lumière). */
  lightAdaptRate: number;
  /** Gain de l'éblouissement résiduel (0..1 en sortie). */
  glareGain: number;
};

export const IMMERSION_EXPOSURE_DEFAULTS: ImmersionExposureParams = {
  darkAdaptRate: 0.3,
  lightAdaptRate: 0.55,
  glareGain: 1.7,
};

export function createImmersionExposure(initial: number): ImmersionExposureState {
  return { current: initial };
}

/**
 * Avance l'adaptation d'un pas. Retourne l'éblouissement 0..1 : combien
 * l'œil est encore sur-exposé par rapport à la cible (à afficher comme
 * voile blanc, uniquement hors du noir — pondérer côté appelant).
 */
export function stepImmersionExposure(
  state: ImmersionExposureState,
  target: number,
  dt: number,
  params: ImmersionExposureParams = IMMERSION_EXPOSURE_DEFAULTS
): number {
  const rate = target > state.current ? params.darkAdaptRate : params.lightAdaptRate;
  state.current += (target - state.current) * Math.min(1, dt * rate);

  const over = Math.max(0, state.current - target);

  return Math.min(1, over * params.glareGain);
}
