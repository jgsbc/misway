/**
 * IMMERSION CORE — graphe d'ambiance sonore.
 * Briques procédurales réutilisables : sources de bruit, bus filtrés avec
 * panoramique, événements ponctuels spatialisés. Aucune musique, aucun
 * fichier ; le monde décide des gains par zone, le core fournit la matière.
 */

export function makeNoiseBuffer(ctx: AudioContext, seconds: number, brown: boolean) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;

    if (brown) {
      last = (last + white * 0.02) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }

  return buffer;
}

export type ImmersionNoiseBus = {
  gain: GainNode;
  pan: StereoPannerNode;
  filter: BiquadFilterNode;
};

/** Bruit en boucle → filtre → gain → pan → destination. */
export function makeNoiseBus(
  ctx: AudioContext,
  destination: AudioNode,
  options: {
    brown?: boolean;
    seconds?: number;
    type: BiquadFilterType;
    frequency: number;
    q?: number;
    gain?: number;
  }
): ImmersionNoiseBus {
  const source = ctx.createBufferSource();
  source.buffer = makeNoiseBuffer(ctx, options.seconds ?? 3, options.brown ?? false);
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = options.type;
  filter.frequency.value = options.frequency;

  if (options.q !== undefined) filter.Q.value = options.q;

  const gain = ctx.createGain();
  gain.gain.value = options.gain ?? 0;
  const pan = ctx.createStereoPanner();
  source.connect(filter).connect(gain).connect(pan).connect(destination);
  source.start();

  return { gain, pan, filter };
}

/**
 * Événement ponctuel : bouffée de bruit filtrée, enveloppe percussive,
 * panoramique donné. Pour les claquements lointains, chocs de chantier…
 */
export function playFilteredBurst(
  ctx: AudioContext,
  destination: AudioNode,
  options: {
    frequency: number;
    q?: number;
    gain: number;
    attack?: number;
    decay: number;
    pan?: number;
  }
) {
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  source.buffer = makeNoiseBuffer(ctx, Math.min(1, options.decay + 0.1), false);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = options.frequency;
  filter.Q.value = options.q ?? 6;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(options.gain, now + (options.attack ?? 0.005));
  env.gain.exponentialRampToValueAtTime(0.0001, now + options.decay);
  const pan = ctx.createStereoPanner();
  pan.pan.value = options.pan ?? 0;
  source.connect(filter).connect(env).connect(pan).connect(destination);
  source.start(now);
  source.stop(now + options.decay + 0.1);
}

/** Glissando grave (grondement, gémissement de structure). */
export function playGroan(
  ctx: AudioContext,
  destination: AudioNode,
  options: {
    from: number;
    to: number;
    duration: number;
    gain: number;
    pan?: number;
  }
) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(options.from, now);
  osc.frequency.exponentialRampToValueAtTime(options.to, now + options.duration);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 160;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(options.gain, now + options.duration * 0.3);
  env.gain.exponentialRampToValueAtTime(0.0001, now + options.duration);
  const pan = ctx.createStereoPanner();
  pan.pan.value = options.pan ?? 0;
  osc.connect(filter).connect(env).connect(pan).connect(destination);
  osc.start(now);
  osc.stop(now + options.duration + 0.1);
}
