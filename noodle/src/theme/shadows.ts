type Shadows = [
  'none',
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

/**
 * MUI's default shadows are really harsh, this creates a softer shadow utilizing a light
 * and dark overlapping soft shadow effect
 *
 * @param spread [0.0-1.0] multiplier for how large the shadows should appear
 * @param opacity [0.0-1.0] multiplier for the opacity of the shadows (how dark they are)
 * @param lightColorRgb 3 integer RGB values representing the light shadow color
 * @param darkColorRgb 3 integer RGB values representing the dark shadow color
 */
export const generateShadows = (
  spread: number = 0.25,
  opacity: number = 0.5,
  lightColorRgb: number[] = [60, 60, 80],
  darkColorRgb: number[] = [15, 15, 30]
): Shadows =>
  new Array(25).fill(null).map((_, idx) => {
    if (idx === 0) return 'none';
    const multiplier = spread * idx;
    return `0 ${multiplier * 2}px ${multiplier * 5}px rgba(${darkColorRgb[0]}, ${darkColorRgb[1]}, ${
      darkColorRgb[2]
    }, ${0.025 * opacity}), 0 ${multiplier * 7}px ${multiplier * 20}px rgba(${lightColorRgb[0]}, ${lightColorRgb[1]}, ${
      lightColorRgb[2]
    }, ${0.2 * opacity})`;
  }) as Shadows;
