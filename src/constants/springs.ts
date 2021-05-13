export const SPRINGS = {
  /**
   * Agile, not bouncy, very similar to direct movement with
   * just a little easing. Good for draggables.
   */
  RESPONSIVE: {
    mass: 0.1,
    tension: 700,
    friction: 20,
  },
  QUICK: {
    mass: 1,
    tension: 200,
    friction: 35,
  },
  RELAXED: {
    mass: 10,
    tension: 95,
    friction: 55,
  },
  WOBBLY: {
    tension: 180,
    friction: 12,
  },
};
