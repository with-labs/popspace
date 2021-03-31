export function isRightClick(event: React.PointerEvent | PointerEvent | MouseEvent | React.MouseEvent) {
  return event.button === 2;
}
