export const TEMPLATE_DRAG_THRESHOLD = 8;

export const isTemplateCarouselDrag = (
  start: { x: number; y: number },
  current: { x: number; y: number },
  threshold = TEMPLATE_DRAG_THRESHOLD,
) => {
  const deltaX = Math.abs(current.x - start.x);
  const deltaY = Math.abs(current.y - start.y);
  return deltaX >= threshold && deltaX > deltaY;
};
