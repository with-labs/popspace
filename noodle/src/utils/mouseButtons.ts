export function isRightClick(event: React.PointerEvent | PointerEvent | MouseEvent | React.MouseEvent) {
  return event.buttons && (event.buttons & 2) === 2;
}

export function isMiddleClick(event: React.PointerEvent | PointerEvent | MouseEvent | React.MouseEvent) {
  return event.buttons && (event.buttons & 4) === 4;
}

export function isLeftClick(event: React.PointerEvent | PointerEvent | MouseEvent | React.MouseEvent) {
  return event.buttons && (event.buttons & 1) === 1;
}

export function isNoClick(event: React.PointerEvent | PointerEvent | MouseEvent | React.MouseEvent) {
  return event.buttons === 0;
}
