/**
 * IMMERSION CORE — interaction.
 *
 * Modèle : « le monde t'emporte, ta main dirige ».
 * L'avance est automatique et gouvernée par la scène ; l'utilisateur ne
 * fournit qu'un axe de direction analogique et un frein contextuel. Aucun
 * pad permanent, aucun catalogue de schémas concurrents à l'écran : le
 * périphérique décide seul de la lecture primaire.
 *
 *   souris   → la position horizontale du pointeur dirige (zone morte au centre)
 *   tactile  → poser le doigt et glisser dirige (relatif, invisible)
 *   manette  → stick gauche dirige, gâchettes accélèrent/freinent
 *   clavier  → alternative d'accessibilité, jamais annoncée à l'écran
 *
 * Frein : espace / clic maintenu / second doigt / gâchette gauche.
 */

export type ImmersionInputMode = "pointer" | "touch" | "gamepad" | "keyboard";

export type ImmersionInputSnapshot = {
  /** −1 (gauche) .. 1 (droite), déjà lissé et courbé. */
  steer: number;
  /** 0..1 — freinage volontaire. */
  brake: number;
  /** 0..1 quand l'utilisateur pousse activement, sinon null (régie auto). */
  throttleOverride: number | null;
  /** Dernier périphérique réellement utilisé. */
  mode: ImmersionInputMode;
  /** L'utilisateur a-t-il déjà dirigé au moins une fois ? */
  engaged: boolean;
};

const STEER_DEADZONE = 0.06;
const STEER_EXPO = 1.3;
/** Débattement tactile pour un braquage complet, en pixels. */
const TOUCH_FULL_LOCK = 96;

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

const STEER_KEYS_LEFT = new Set(["ArrowLeft", "KeyA", "KeyQ"]);
const STEER_KEYS_RIGHT = new Set(["ArrowRight", "KeyD"]);
const THROTTLE_KEYS = new Set(["ArrowUp", "KeyW", "KeyZ"]);
const BRAKE_KEYS = new Set(["ArrowDown", "KeyS", "Space"]);

export class ImmersionInput {
  private target: number = 0;
  private smoothed: number = 0;
  private brakeTarget = 0;
  private smoothedBrake = 0;
  private throttleKey = false;
  private mode: ImmersionInputMode = "pointer";
  private engaged = false;

  private pointerId: number | null = null;
  private touchOrigin: number | null = null;
  private extraPointers = new Set<number>();
  private mouseDown = false;
  private keyLeft = false;
  private keyRight = false;
  private keyBrake = false;
  private detachFns: Array<() => void> = [];
  private onEngage: (() => void) | null = null;

  /** Attache les écouteurs. `element` sert au tactile ; le reste écoute window. */
  attach(element: HTMLElement, onEngage?: () => void) {
    this.onEngage = onEngage ?? null;

    const markEngaged = () => {
      if (!this.engaged) {
        this.engaged = true;
        this.onEngage?.();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        if (event.pointerId !== this.pointerId || this.touchOrigin === null) return;

        this.mode = "touch";
        this.target = (event.clientX - this.touchOrigin) / TOUCH_FULL_LOCK;

        if (Math.abs(event.clientX - this.touchOrigin) > 6) markEngaged();

        return;
      }

      this.mode = "pointer";
      // Position absolue du pointeur : le centre de la fenêtre est le point mort.
      this.target = (event.clientX / window.innerWidth) * 2 - 1;
      markEngaged();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.pointerType === "touch") {
        if (this.pointerId === null) {
          this.pointerId = event.pointerId;
          this.touchOrigin = event.clientX;
          this.mode = "touch";
        } else {
          // Second doigt : frein.
          this.extraPointers.add(event.pointerId);
        }

        return;
      }

      this.mouseDown = true;
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        this.extraPointers.delete(event.pointerId);

        if (event.pointerId === this.pointerId) {
          this.pointerId = null;
          this.touchOrigin = null;
          this.target = 0;
        }

        return;
      }

      this.mouseDown = false;
    };

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

      if (STEER_KEYS_LEFT.has(event.code)) {
        this.keyLeft = true;
      } else if (STEER_KEYS_RIGHT.has(event.code)) {
        this.keyRight = true;
      } else if (BRAKE_KEYS.has(event.code)) {
        this.keyBrake = true;
      } else if (THROTTLE_KEYS.has(event.code)) {
        this.throttleKey = true;
      } else {
        return;
      }

      event.preventDefault();

      if (STEER_KEYS_LEFT.has(event.code) || STEER_KEYS_RIGHT.has(event.code)) {
        this.mode = "keyboard";
        markEngaged();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (STEER_KEYS_LEFT.has(event.code)) this.keyLeft = false;
      else if (STEER_KEYS_RIGHT.has(event.code)) this.keyRight = false;
      else if (BRAKE_KEYS.has(event.code)) this.keyBrake = false;
      else if (THROTTLE_KEYS.has(event.code)) this.throttleKey = false;
    };

    const release = () => {
      this.keyLeft = false;
      this.keyRight = false;
      this.keyBrake = false;
      this.throttleKey = false;
      this.mouseDown = false;
      this.pointerId = null;
      this.touchOrigin = null;
      this.extraPointers.clear();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    element.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);

    this.detachFns = [
      () => window.removeEventListener("pointermove", handlePointerMove),
      () => element.removeEventListener("pointerdown", handlePointerDown),
      () => window.removeEventListener("pointerup", handlePointerUp),
      () => window.removeEventListener("pointercancel", handlePointerUp),
      () => window.removeEventListener("keydown", handleKeyDown, true),
      () => window.removeEventListener("keyup", handleKeyUp),
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

  private readGamepad(): { steer: number; brake: number; throttle: number } | null {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return null;

    for (const pad of navigator.getGamepads()) {
      if (!pad) continue;

      const axis = pad.axes[0] ?? 0;
      const rightTrigger = pad.buttons[7]?.value ?? 0;
      const leftTrigger = pad.buttons[6]?.value ?? 0;
      const active =
        Math.abs(axis) > 0.12 || rightTrigger > 0.05 || leftTrigger > 0.05;

      if (!active) continue;

      return { steer: axis, brake: leftTrigger, throttle: rightTrigger };
    }

    return null;
  }

  /** Lit l'état courant et avance le lissage d'un pas. */
  read(dt: number): ImmersionInputSnapshot {
    let target = this.target;
    let brake = 0;
    let throttleOverride: number | null = null;

    const pad = this.readGamepad();

    if (pad) {
      this.mode = "gamepad";

      if (!this.engaged && Math.abs(pad.steer) > 0.2) {
        this.engaged = true;
        this.onEngage?.();
      }

      target = pad.steer;
      brake = pad.brake;

      if (pad.throttle > 0.05) throttleOverride = pad.throttle;
    } else {
      if (this.keyLeft !== this.keyRight) {
        this.mode = "keyboard";
        target = this.keyLeft ? -1 : 1;
      }

      if (this.keyBrake || this.mouseDown || this.extraPointers.size > 0) brake = 1;

      if (this.throttleKey) throttleOverride = 1;

      // Le tactile relâché revient droit de lui-même.
      if (this.mode === "touch" && this.pointerId === null) target = 0;
    }

    // Lissage : la direction a de l'inertie, jamais de saut.
    const steerEase = 1 - Math.exp(-dt * 9);
    this.smoothed += (applyCurve(target) - this.smoothed) * steerEase;

    const brakeEase = 1 - Math.exp(-dt * (brake > this.smoothedBrake ? 14 : 7));
    this.smoothedBrake += (brake - this.smoothedBrake) * brakeEase;

    return {
      steer: this.smoothed,
      brake: this.smoothedBrake,
      throttleOverride,
      mode: this.mode,
      engaged: this.engaged,
    };
  }
}

/**
 * Régie d'avance : vitesse de croisière contextuelle. La scène fournit un
 * facteur 0..1 par zone (resserrement, lieu à observer) ; le frein de
 * l'utilisateur l'emporte toujours.
 */
export function immersionCruiseScale(
  contextScale: number,
  brake: number,
  throttleOverride: number | null
) {
  const base = throttleOverride === null ? contextScale : Math.max(contextScale, throttleOverride);

  return Math.max(0, base * (1 - brake));
}
