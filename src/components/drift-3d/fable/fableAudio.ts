import {
  makeNoiseBus,
  playFilteredBurst,
  playGroan,
  type ImmersionNoiseBus,
} from "@/components/drift-3d/fable/core/immersionAudio";

/**
 * FABLE SPIKE — ambiance sonore entièrement procédurale (WebAudio), montée
 * sur les bus du core (immersionAudio). Vent, rumeur, gouttes en écho,
 * moteur lié à la vitesse, sifflement localisé des bouches de vapeur,
 * claquements lointains de chantier, et le gémissement des amarres quand la
 * tension monte. Ne démarre que sur geste utilisateur.
 */

export type FableAmbienceParams = {
  speed: number;
  tunnel: number;
  city: number;
  yard: number;
  /** 0..1 proximité de la bouche de vapeur la plus proche. */
  ventNear: number;
  /** −1..1 côté de cette bouche. */
  ventPan: number;
  /** 0..1 impulsion de tension d'amarre (déjà pondérée par la cour). */
  pulse: number;
};

export class FableAmbience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wind: ImmersionNoiseBus | null = null;
  private murmur: ImmersionNoiseBus | null = null;
  private hiss: ImmersionNoiseBus | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineSub: OscillatorNode | null = null;
  private dripGain: GainNode | null = null;
  private creak: ImmersionNoiseBus | null = null;
  private dripTimer: number | null = null;
  private clangTimer: number | null = null;
  private groanArmed = true;
  private params: FableAmbienceParams = {
    speed: 0,
    tunnel: 1,
    city: 0,
    yard: 0,
    ventNear: 0,
    ventPan: 0,
    pulse: 0,
  };

  get running() {
    return this.ctx !== null;
  }

  start() {
    if (this.ctx) return;

    const ctx = new AudioContext();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    const compressor = ctx.createDynamicsCompressor();
    master.connect(compressor);
    compressor.connect(ctx.destination);
    this.master = master;
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.8);

    // Vent — bruit brun filtré, respiration lente.
    this.wind = makeNoiseBus(ctx, master, {
      brown: true,
      seconds: 4,
      type: "lowpass",
      frequency: 320,
      gain: 0.1,
    });
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.07;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 0.05;
    windLfo.connect(windLfoGain).connect(this.wind.gain.gain);
    windLfo.start();

    // Rumeur de ville — mille conversations lointaines.
    this.murmur = makeNoiseBus(ctx, master, {
      type: "bandpass",
      frequency: 760,
      q: 0.7,
      gain: 0,
    });

    // Sifflement de vapeur — bruit haut, très localisé, panoramique.
    this.hiss = makeNoiseBus(ctx, master, {
      type: "highpass",
      frequency: 2800,
      gain: 0,
    });

    // Moteur — dent de scie grave + sous-basse, suit la vitesse.
    const engineOsc = ctx.createOscillator();
    engineOsc.type = "sawtooth";
    engineOsc.frequency.value = 42;
    const engineSub = ctx.createOscillator();
    engineSub.type = "sine";
    engineSub.frequency.value = 58;
    const engineFilter = ctx.createBiquadFilter();
    engineFilter.type = "lowpass";
    engineFilter.frequency.value = 240;
    const engineGain = ctx.createGain();
    engineGain.gain.value = 0;
    engineOsc.connect(engineFilter);
    engineSub.connect(engineFilter);
    engineFilter.connect(engineGain).connect(master);
    engineOsc.start();
    engineSub.start();
    this.engineOsc = engineOsc;
    this.engineSub = engineSub;
    this.engineGain = engineGain;

    // Gouttes — sinusoïdes brèves dans un délai à réinjection, panées au hasard.
    const dripGain = ctx.createGain();
    dripGain.gain.value = 0.5;
    const delay = ctx.createDelay(1.2);
    delay.delayTime.value = 0.34;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.42;
    const dripFilter = ctx.createBiquadFilter();
    dripFilter.type = "lowpass";
    dripFilter.frequency.value = 2400;
    dripGain.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(dripFilter).connect(master);
    dripGain.connect(dripFilter);
    this.dripGain = dripGain;

    const scheduleDrip = () => {
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 1400 + Math.random() * 1600;
      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(
        (0.05 + Math.random() * 0.06) * this.params.tunnel,
        now + 0.004
      );
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      const pan = this.ctx.createStereoPanner();
      pan.pan.value = (Math.random() - 0.5) * 1.4;
      osc.connect(env).connect(pan).connect(dripGain);
      osc.start(now);
      osc.stop(now + 0.2);
      this.dripTimer = window.setTimeout(scheduleDrip, 500 + Math.random() * 2200);
    };

    scheduleDrip();

    // Claquements lointains de chantier — irréguliers, panés, ville seulement.
    const scheduleClang = () => {
      if (!this.ctx || !this.master) return;

      if (this.params.city > 0.25 && Math.random() < 0.8) {
        playFilteredBurst(this.ctx, this.master, {
          frequency: 380 + Math.random() * 620,
          q: 8,
          gain: (0.02 + Math.random() * 0.035) * this.params.city,
          decay: 0.5 + Math.random() * 0.7,
          pan: (Math.random() - 0.5) * 1.6,
        });
      }

      this.clangTimer = window.setTimeout(scheduleClang, 5000 + Math.random() * 11000);
    };

    this.clangTimer = window.setTimeout(scheduleClang, 4000);

    // Fond de grincement d'amarre — quasi inaudible hors de la cour.
    this.creak = makeNoiseBus(ctx, master, {
      brown: true,
      seconds: 3,
      type: "lowpass",
      frequency: 150,
      gain: 0,
    });
  }

  setParams(params: FableAmbienceParams) {
    const previousPulse = this.params.pulse;
    this.params = params;
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const ramp = 0.25;
    const speedRatio = Math.min(1, params.speed / 6.4);

    this.wind?.gain.gain.setTargetAtTime(0.045 + (1 - params.tunnel) * 0.13, now, ramp);
    this.murmur?.gain.gain.setTargetAtTime(
      params.city * (0.06 + params.yard * 0.035),
      now,
      ramp
    );
    this.hiss?.gain.gain.setTargetAtTime(params.ventNear * 0.05, now, 0.18);
    this.hiss?.pan.pan.setTargetAtTime(params.ventPan, now, 0.18);
    this.engineGain?.gain.setTargetAtTime(
      0.02 + speedRatio * 0.11 + params.tunnel * 0.02,
      now,
      0.12
    );
    this.engineOsc?.frequency.setTargetAtTime(42 + speedRatio * 46, now, 0.12);
    this.engineSub?.frequency.setTargetAtTime(58 + speedRatio * 30, now, 0.12);
    this.dripGain?.gain.setTargetAtTime(params.tunnel * 0.6, now, ramp);
    this.creak?.gain.gain.setTargetAtTime(params.yard * 0.04 + params.pulse * 0.05, now, ramp);

    // Le gémissement des amarres : déclenché au front montant de l'impulsion.
    if (params.pulse > 0.5 && previousPulse <= 0.5 && this.groanArmed && this.master) {
      this.groanArmed = false;
      playGroan(ctx, this.master, {
        from: 74,
        to: 46,
        duration: 2.8,
        gain: 0.11 * Math.min(1, params.yard * 1.6),
        pan: (Math.random() - 0.5) * 0.5,
      });
    }

    if (params.pulse < 0.2) this.groanArmed = true;
  }

  stop() {
    if (this.dripTimer !== null) {
      window.clearTimeout(this.dripTimer);
      this.dripTimer = null;
    }

    if (this.clangTimer !== null) {
      window.clearTimeout(this.clangTimer);
      this.clangTimer = null;
    }

    if (this.ctx) {
      const ctx = this.ctx;
      this.master?.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      window.setTimeout(() => {
        ctx.close().catch(() => undefined);
      }, 600);
      this.ctx = null;
      this.master = null;
      this.wind = null;
      this.murmur = null;
      this.hiss = null;
      this.engineGain = null;
      this.engineOsc = null;
      this.engineSub = null;
      this.dripGain = null;
      this.creak = null;
    }
  }
}
