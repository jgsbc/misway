/**
 * IMMERSION CORE — interaction.
 *
 * Le joueur conduit. Rien n'avance à sa place, rien ne corrige sa
 * direction, rien ne le remet sur la route contre son gré.
 *
 *   clavier   W/Z/↑ accélère · S/↓ freine puis recule · A/Q/← et D/→ braquent
 *   molette   zoom caméra
 *   tactile   pouce gauche : braquage analogique invisible
 *             pouce droit  : maintenir = accélérer, glisser vers le bas =
 *                            freiner puis reculer
 *             deux doigts  : pincer pour zoomer
 *   manette   stick gauche braque · gâchette droite accélère ·
 *             gâchette gauche freine/recule · stick droit zoome
 *
 * La position de la souris ne dirige rien.
 */

export type ImmersionInputMode = "keyboard" | "touch" | "gamepad";

export type ImmersionInputSnapshot = {
  /** −1 gauche … 1 droite. Autorité pleine du joueur. */
  steer: number;
  /** 0 … 1 — accélération demandée. */
  throttle: number;
  /** 0 … 1 — frein, puis marche arrière une fois à l'arrêt. */
  brake: number;
  /** Variation de zoom accumulée depuis la lecture précédente. */
  zoomDelta: number;
  mode: ImmersionInputMode;
  /** L'utilisateur a-t-il déjà agi ? Sert à effacer l'amorce. */
  engaged: boolean;
  /**
   * Demande de secours, vraie une seule image. R au clavier, trois doigts au
   * tactile, B à la manette. Jamais automatique : c'est le joueur qui
   * constate qu'il est coincé, pas le monde qui le décide à sa place.
   */
  recover: boolean;
};

const STEER_DEADZONE = 0.05;
const STEER_EXPO = 1.25;
/** Débattement tactile pour un braquage complet, en pixels. */
const TOUCH_STEER_RANGE = 78;
/** Débattement tactile vertical pour accélérer / freiner. */
const TOUCH_PEDAL_RANGE = 62;
/**
 * Zone morte de la pédale, en fraction du débattement. Un pouce posé sur du
 * verre dérive de plusieurs millimètres sans que son propriétaire le veuille :
 * en deçà de ce seuil, tenir veut dire avancer, jamais freiner.
 */
const TOUCH_PEDAL_DEADZONE = 0.42;

function applyCurve(raw: number) {
  const clamped = Math.max(-1, Math.min(1, raw));
  const magnitude = Math.abs(clamped);

  if (magnitude < STEER_DEADZONE) return 0;

  const rescaled = (magnitude - STEER_DEADZONE) / (1 - STEER_DEADZONE);

  return Math.sign(clamped) * Math.pow(rescaled, STEER_EXPO);
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.tagName === "BUTTON" ||
    target.tagName === "A"
  );
}

const KEYS_LEFT = new Set(["ArrowLeft", "KeyA", "KeyQ"]);
const KEYS_RIGHT = new Set(["ArrowRight", "KeyD"]);
const KEYS_THROTTLE = new Set(["ArrowUp", "KeyW", "KeyZ"]);
const KEYS_BRAKE = new Set(["ArrowDown", "KeyS"]);
const KEYS_RECOVER = new Set(["KeyR"]);

type TouchPoint = {
  id: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
  /** Le pouce gauche braque, le pouce droit fait pédale. */
  role: "steer" | "pedal";
};

export class ImmersionInput {
  private smoothedSteer = 0;
  private smoothedThrottle = 0;
  private smoothedBrake = 0;
  private zoomAccum = 0;
  private mode: ImmersionInputMode = "keyboard";
  private engaged = false;

  private keyLeft = false;
  private keyRight = false;
  private keyThrottle = false;
  private keyBrake = false;

  private touches = new Map<number, TouchPoint>();
  private pinchDistance: number | null = null;
  private recoverPending = false;

  private detachFns: Array<() => void> = [];
  private onEngage: (() => void) | null = null;

  attach(element: HTMLElement, onEngage?: () => void) {
    this.onEngage = onEngage ?? null;

    const markEngaged = () => {
      if (!this.engaged) {
        this.engaged = true;
        this.onEngage?.();
      }
    };

    /* ── Clavier ─────────────────────────────────────────────────────── */

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      if (KEYS_LEFT.has(event.code)) this.keyLeft = true;
      else if (KEYS_RIGHT.has(event.code)) this.keyRight = true;
      else if (KEYS_THROTTLE.has(event.code)) this.keyThrottle = true;
      else if (KEYS_BRAKE.has(event.code)) this.keyBrake = true;
      else if (KEYS_RECOVER.has(event.code)) this.recoverPending = true;
      else return;

      event.preventDefault();
      this.mode = "keyboard";
      markEngaged();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (KEYS_LEFT.has(event.code)) this.keyLeft = false;
      else if (KEYS_RIGHT.has(event.code)) this.keyRight = false;
      else if (KEYS_THROTTLE.has(event.code)) this.keyThrottle = false;
      else if (KEYS_BRAKE.has(event.code)) this.keyBrake = false;
    };

    /* ── Molette : zoom seulement ────────────────────────────────────── */

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      this.zoomAccum += Math.sign(event.deltaY) * 0.12;
    };

    /* ── Tactile ─────────────────────────────────────────────────────── */

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || isEditableTarget(event.target)) return;

      const half = window.innerWidth / 2;
      this.touches.set(event.pointerId, {
        id: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        role: event.clientX < half ? "steer" : "pedal",
      });
      this.mode = "touch";

      // Trois doigts : secours. Le pincement en utilise deux, on ne le
      // déclenche donc pas par accident, et rien n'apparaît à l'écran.
      if (this.touches.size >= 3) this.recoverPending = true;

      markEngaged();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;

      const touch = this.touches.get(event.pointerId);
      if (!touch) return;

      touch.x = event.clientX;
      touch.y = event.clientY;

      // Deux doigts : pincement, le zoom prend la main.
      if (this.touches.size >= 2) {
        const [a, b] = [...this.touches.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        if (this.pinchDistance !== null) {
          this.zoomAccum -= (distance - this.pinchDistance) * 0.006;
        }

        this.pinchDistance = distance;
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;

      this.touches.delete(event.pointerId);

      if (this.touches.size < 2) this.pinchDistance = null;
    };

    const release = () => {
      this.keyLeft = false;
      this.keyRight = false;
      this.keyThrottle = false;
      this.keyBrake = false;
      this.touches.clear();
      this.pinchDistance = null;
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp);
    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);

    this.detachFns = [
      () => window.removeEventListener("keydown", handleKeyDown, true),
      () => window.removeEventListener("keyup", handleKeyUp),
      () => element.removeEventListener("wheel", handleWheel),
      () => element.removeEventListener("pointerdown", handlePointerDown),
      () => window.removeEventListener("pointermove", handlePointerMove),
      () => window.removeEventListener("pointerup", handlePointerUp),
      () => window.removeEventListener("pointercancel", handlePointerUp),
      () => window.removeEventListener("blur", release),
      () => document.removeEventListener("visibilitychange", release),
      release,
    ];
  }

  detach() {
    for (const fn of this.detachFns) fn();

    this.detachFns = [];
    this.onEngage = null;
  }

  private readGamepad() {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return null;

    for (const pad of navigator.getGamepads()) {
      if (!pad) continue;

      const steer = pad.axes[0] ?? 0;
      const zoomAxis = pad.axes[3] ?? 0;
      const throttle = pad.buttons[7]?.value ?? 0;
      const brake = pad.buttons[6]?.value ?? 0;

      if (pad.buttons[1]?.pressed) this.recoverPending = true;

      const active =
        Math.abs(steer) > 0.12 ||
        throttle > 0.04 ||
        brake > 0.04 ||
        Math.abs(zoomAxis) > 0.2;

      if (!active) continue;

      return { steer, throttle, brake, zoomAxis };
    }

    return null;
  }

  read(dt: number): ImmersionInputSnapshot {
    let steerTarget = 0;
    let throttleTarget = 0;
    let brakeTarget = 0;

    const pad = this.readGamepad();

    if (pad) {
      this.mode = "gamepad";

      if (!this.engaged) {
        this.engaged = true;
        this.onEngage?.();
      }

      steerTarget = pad.steer;
      throttleTarget = pad.throttle;
      brakeTarget = pad.brake;

      if (Math.abs(pad.zoomAxis) > 0.2) this.zoomAccum += pad.zoomAxis * dt * 1.6;
    } else if (this.touches.size > 0) {
      for (const touch of this.touches.values()) {
        if (touch.role === "steer") {
          steerTarget = (touch.x - touch.originX) / TOUCH_STEER_RANGE;
        } else {
          // Maintenir accélère ; descendre franchement sous le point d'appui
          // freine. Le seuil est large exprès : c'est un geste, pas une dérive.
          const drop = (touch.y - touch.originY) / TOUCH_PEDAL_RANGE;

          if (drop > TOUCH_PEDAL_DEADZONE) {
            brakeTarget = Math.min(1, (drop - TOUCH_PEDAL_DEADZONE) / 0.85);
            throttleTarget = 0;
          } else {
            brakeTarget = 0;
            throttleTarget = Math.min(1, 0.55 + Math.max(0, -drop));
          }
        }
      }
    } else {
      if (this.keyLeft !== this.keyRight) steerTarget = this.keyLeft ? -1 : 1;

      throttleTarget = this.keyThrottle ? 1 : 0;
      brakeTarget = this.keyBrake ? 1 : 0;
    }

    // Lissage : la direction a de l'inertie, jamais de saut.
    const steerEase = 1 - Math.exp(-dt * 10);
    this.smoothedSteer += (applyCurve(steerTarget) - this.smoothedSteer) * steerEase;

    const pedalEase = 1 - Math.exp(-dt * 14);
    this.smoothedThrottle += (throttleTarget - this.smoothedThrottle) * pedalEase;
    this.smoothedBrake += (brakeTarget - this.smoothedBrake) * pedalEase;

    const zoomDelta = this.zoomAccum;
    this.zoomAccum = 0;
    const recover = this.recoverPending;
    this.recoverPending = false;

    return {
      steer: this.smoothedSteer,
      throttle: this.smoothedThrottle,
      brake: this.smoothedBrake,
      zoomDelta,
      mode: this.mode,
      engaged: this.engaged,
      recover,
    };
  }
}
