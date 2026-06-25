export type DriftPoint = {
  x: number;
  y: number;
};

export type DriftBounds = {
  width: number;
  height: number;
};

export type DriftMovementInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type DriftPointerRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type DriftVehicleState = {
  position: DriftPoint;
  facing: number;
  isMoving: boolean;
};

const movementKeyCodes = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
]);

export function isDriftMovementKey(code: string) {
  return movementKeyCodes.has(code);
}

export function getMovementInput(pressedKeys: ReadonlySet<string>): DriftMovementInput {
  return {
    up: pressedKeys.has("ArrowUp") || pressedKeys.has("KeyW"),
    down: pressedKeys.has("ArrowDown") || pressedKeys.has("KeyS"),
    left: pressedKeys.has("ArrowLeft") || pressedKeys.has("KeyA"),
    right: pressedKeys.has("ArrowRight") || pressedKeys.has("KeyD"),
  };
}

export function hasActiveMovementInput(input: DriftMovementInput) {
  return input.up || input.down || input.left || input.right;
}

export function clampPosition(position: DriftPoint, bounds: DriftBounds): DriftPoint {
  return {
    x: Math.min(Math.max(position.x, 0), bounds.width),
    y: Math.min(Math.max(position.y, 0), bounds.height),
  };
}

export function getMapPointFromClientPoint({
  clientX,
  clientY,
  rect,
  bounds,
}: {
  clientX: number;
  clientY: number;
  rect: DriftPointerRect;
  bounds: DriftBounds;
}): DriftPoint {
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 0, y: 0 };
  }

  return clampPosition(
    {
      x: ((clientX - rect.left) / rect.width) * bounds.width,
      y: ((clientY - rect.top) / rect.height) * bounds.height,
    },
    bounds
  );
}

export function getNextDriftVehicleState({
  state,
  input,
  deltaSeconds,
  speed,
  bounds,
}: {
  state: DriftVehicleState;
  input: DriftMovementInput;
  deltaSeconds: number;
  speed: number;
  bounds: DriftBounds;
}): DriftVehicleState {
  const horizontal = Number(input.right) - Number(input.left);
  const vertical = Number(input.down) - Number(input.up);
  const magnitude = Math.hypot(horizontal, vertical);

  if (magnitude === 0) {
    return {
      ...state,
      isMoving: false,
    };
  }

  const normalizedX = horizontal / magnitude;
  const normalizedY = vertical / magnitude;
  const nextPosition = clampPosition(
    {
      x: state.position.x + normalizedX * speed * deltaSeconds,
      y: state.position.y + normalizedY * speed * deltaSeconds,
    },
    bounds
  );

  return {
    position: nextPosition,
    facing: Math.atan2(normalizedY, normalizedX) * (180 / Math.PI),
    isMoving: true,
  };
}

export function getNextDriftVehicleStateTowardTarget({
  state,
  target,
  deltaSeconds,
  speed,
  bounds,
  stopDistance = 8,
}: {
  state: DriftVehicleState;
  target: DriftPoint;
  deltaSeconds: number;
  speed: number;
  bounds: DriftBounds;
  stopDistance?: number;
}): DriftVehicleState {
  const clampedTarget = clampPosition(target, bounds);
  const horizontal = clampedTarget.x - state.position.x;
  const vertical = clampedTarget.y - state.position.y;
  const distance = Math.hypot(horizontal, vertical);

  if (distance <= stopDistance) {
    return {
      ...state,
      isMoving: false,
    };
  }

  const travelDistance = Math.min(speed * deltaSeconds, distance);
  const normalizedX = horizontal / distance;
  const normalizedY = vertical / distance;
  const nextPosition = clampPosition(
    {
      x: state.position.x + normalizedX * travelDistance,
      y: state.position.y + normalizedY * travelDistance,
    },
    bounds
  );

  return {
    position: nextPosition,
    facing: Math.atan2(normalizedY, normalizedX) * (180 / Math.PI),
    isMoving: true,
  };
}

export function hasVehicleStateChanged(
  previous: DriftVehicleState,
  next: DriftVehicleState
) {
  return (
    previous.position.x !== next.position.x ||
    previous.position.y !== next.position.y ||
    previous.facing !== next.facing ||
    previous.isMoving !== next.isMoving
  );
}

export function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
