import { drift3dEras, drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";

/**
 * Ambiances diégétiques par zone (bible §audio) : rumeur urbaine, vent de
 * montagne, nappe de plaine, nuit, pluie de tempête, ressac. Tout est
 * synthétisé en WebAudio (bruit filtré + LFO) — aucun asset requis, et le
 * moteur ne démarre que sur geste utilisateur explicite (gouvernance audio).
 * Le mix suit la position du véhicule et se duck sous la musique d'un track.
 */

export type Drift3DAmbienceMix = {
  urban: number;
  wind: number;
  field: number;
  night: number;
  rain: number;
  sea: number;
};

export type Drift3DVehicleEngineProfile = {
  baseFrequency: number;
  overtoneFrequency: number;
  gain: number;
};

type AmbienceLayerName = keyof Drift3DAmbienceMix;

type AmbienceLayerSpec = {
  noise: "white" | "brown";
  filterType: BiquadFilterType;
  frequency: number;
  q?: number;
  /** Base gain at full mix weight. */
  level: number;
  /** Optional amplitude LFO: [frequencyHz, depth 0..1]. */
  lfo?: [number, number];
};

const layerSpecs: Record<AmbienceLayerName, AmbienceLayerSpec> = {
  // rumeur urbaine continue — grave, presque du trafic lointain
  urban: { noise: "brown", filterType: "lowpass", frequency: 200, level: 0.55 },
  // vent d'altitude — souffle médium qui respire lentement
  wind: {
    noise: "white",
    filterType: "bandpass",
    frequency: 380,
    q: 0.6,
    level: 0.4,
    lfo: [0.16, 0.45],
  },
  // plaine couverte — nappe douce quasi immobile
  field: { noise: "white", filterType: "lowpass", frequency: 480, level: 0.14 },
  // nuit — stridulation très discrète
  night: {
    noise: "white",
    filterType: "bandpass",
    frequency: 2300,
    q: 4,
    level: 0.1,
    lfo: [5.4, 0.5],
  },
  // pluie de la lande — souffle haut dense
  rain: {
    noise: "white",
    filterType: "highpass",
    frequency: 1300,
    level: 0.5,
  },
  // ressac de l'aube — vagues lentes
  sea: {
    noise: "white",
    filterType: "lowpass",
    frequency: 520,
    level: 0.45,
    lfo: [0.08, 0.7],
  },
};

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

/**
 * A compact diesel-like response curve. The input is normalized vehicle
 * speed, which keeps this audio layer independent from the physics tuning.
 */
export function getDrift3DVehicleEngineProfile(
  normalizedSpeed: number
): Drift3DVehicleEngineProfile {
  const speed = clamp01(Math.abs(normalizedSpeed));
  const revs = Math.sqrt(speed);

  return {
    baseFrequency: 38 + revs * 54,
    overtoneFrequency: 76 + revs * 108,
    gain: 0.34 + revs * 0.3,
  };
}

function createNoiseBuffer(context: AudioContext, type: "white" | "brown") {
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;

    if (type === "brown") {
      last = (last + 0.02 * white) / 1.02;
      data[index] = last * 3.5;
    } else {
      data[index] = white;
    }
  }

  return buffer;
}

export class Drift3DAmbienceEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private layerGains = new Map<AmbienceLayerName, GainNode>();
  private vehicleGain: GainNode | null = null;
  private vehicleBaseOscillator: OscillatorNode | null = null;
  private vehicleOvertoneOscillator: OscillatorNode | null = null;

  get isRunning() {
    return this.context !== null;
  }

  start() {
    if (this.context) {
      return;
    }

    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);

    const vehicleFilter = context.createBiquadFilter();
    vehicleFilter.type = "lowpass";
    vehicleFilter.frequency.value = 420;
    vehicleFilter.Q.value = 0.8;

    const vehicleGain = context.createGain();
    const idleProfile = getDrift3DVehicleEngineProfile(0);
    vehicleGain.gain.value = idleProfile.gain;
    vehicleFilter.connect(vehicleGain);
    vehicleGain.connect(master);

    const vehicleBaseOscillator = context.createOscillator();
    vehicleBaseOscillator.type = "sawtooth";
    vehicleBaseOscillator.frequency.value = idleProfile.baseFrequency;
    const vehicleBaseGain = context.createGain();
    vehicleBaseGain.gain.value = 0.72;
    vehicleBaseOscillator.connect(vehicleBaseGain);
    vehicleBaseGain.connect(vehicleFilter);

    const vehicleOvertoneOscillator = context.createOscillator();
    vehicleOvertoneOscillator.type = "triangle";
    vehicleOvertoneOscillator.frequency.value = idleProfile.overtoneFrequency;
    const vehicleOvertoneGain = context.createGain();
    vehicleOvertoneGain.gain.value = 0.28;
    vehicleOvertoneOscillator.connect(vehicleOvertoneGain);
    vehicleOvertoneGain.connect(vehicleFilter);

    vehicleBaseOscillator.start();
    vehicleOvertoneOscillator.start();

    for (const [name, spec] of Object.entries(layerSpecs) as Array<
      [AmbienceLayerName, AmbienceLayerSpec]
    >) {
      const source = context.createBufferSource();
      source.buffer = createNoiseBuffer(context, spec.noise);
      source.loop = true;

      const filter = context.createBiquadFilter();
      filter.type = spec.filterType;
      filter.frequency.value = spec.frequency;
      filter.Q.value = spec.q ?? 1;

      const layerGain = context.createGain();
      layerGain.gain.value = 0;

      source.connect(filter);

      if (spec.lfo) {
        const breathGain = context.createGain();
        breathGain.gain.value = 1 - spec.lfo[1] * 0.5;
        const lfo = context.createOscillator();
        lfo.frequency.value = spec.lfo[0];
        const lfoDepth = context.createGain();
        lfoDepth.gain.value = spec.lfo[1] * 0.5;
        lfo.connect(lfoDepth);
        lfoDepth.connect(breathGain.gain);
        filter.connect(breathGain);
        breathGain.connect(layerGain);
        lfo.start();
      } else {
        filter.connect(layerGain);
      }

      layerGain.connect(master);
      source.start();
      this.layerGains.set(name, layerGain);
    }

    this.context = context;
    this.masterGain = master;
    this.vehicleGain = vehicleGain;
    this.vehicleBaseOscillator = vehicleBaseOscillator;
    this.vehicleOvertoneOscillator = vehicleOvertoneOscillator;
    void context.resume();
  }

  setMix(mix: Drift3DAmbienceMix, masterLevel: number) {
    const context = this.context;
    const master = this.masterGain;

    if (!context || !master) {
      return;
    }

    master.gain.setTargetAtTime(masterLevel, context.currentTime, 0.4);

    for (const [name, gain] of this.layerGains) {
      const target = mix[name] * layerSpecs[name].level;
      gain.gain.setTargetAtTime(target, context.currentTime, 0.6);
    }
  }

  setVehicleSpeed(normalizedSpeed: number) {
    const context = this.context;
    const gain = this.vehicleGain;
    const base = this.vehicleBaseOscillator;
    const overtone = this.vehicleOvertoneOscillator;

    if (!context || !gain || !base || !overtone) {
      return;
    }

    const profile = getDrift3DVehicleEngineProfile(normalizedSpeed);
    gain.gain.setTargetAtTime(profile.gain, context.currentTime, 0.12);
    base.frequency.setTargetAtTime(
      profile.baseFrequency,
      context.currentTime,
      0.1
    );
    overtone.frequency.setTargetAtTime(
      profile.overtoneFrequency,
      context.currentTime,
      0.1
    );
  }

  stop() {
    const context = this.context;

    this.context = null;
    this.masterGain = null;
    this.layerGains.clear();
    this.vehicleGain = null;
    this.vehicleBaseOscillator = null;
    this.vehicleOvertoneOscillator = null;

    if (context) {
      void context.close();
    }
  }
}

function regionWeight(
  x: number,
  z: number,
  centerX: number,
  centerZ: number,
  radius: number
) {
  const distance = Math.hypot(x - centerX, z - centerZ);
  const outside = Math.max(0, distance - radius * 0.5);

  return 1 / (1 + outside * outside * 0.02);
}

export function getDrift3DAmbienceMixAt(position: {
  x: number;
  z: number;
}): Drift3DAmbienceMix {
  const weights: Record<string, number> = {};
  let total = 0;

  for (const era of drift3dEras) {
    const weight = regionWeight(
      position.x,
      position.z,
      era.center.x,
      era.center.z,
      era.radius
    );
    weights[era.id] = weight;
    total += weight;
  }

  const storm = drift3dTrackNodeBySlug["hold-the-light"].position;
  const shore = drift3dTrackNodeBySlug.renee.position;
  const ocean = drift3dTrackNodeBySlug.eteeaooete.position;
  const stormDistance = Math.hypot(position.x - storm.x, position.z - storm.z);
  const shoreDistance = Math.hypot(position.x - shore.x, position.z - shore.z);
  // les vagues immenses d'ÉTÉÉAOOÉTÉ portent plus loin que le ressac de RENEE
  const oceanDistance = Math.hypot(position.x - ocean.x, position.z - ocean.z);
  const seaFromShore = 1 - (shoreDistance - 5) / 9;
  const seaFromOcean = 1 - (oceanDistance - 6) / 12;

  return {
    urban: (weights["birth-yard"] ?? 0) / total,
    wind: (weights["older-shadows"] ?? 0) / total,
    field: (weights["vegetative-field"] ?? 0) / total,
    night: (weights["new-signal"] ?? 0) / total,
    rain: Math.min(1, Math.max(0, 1 - (stormDistance - 5) / 9)),
    sea: Math.min(1, Math.max(0, Math.max(seaFromShore, seaFromOcean))),
  };
}
