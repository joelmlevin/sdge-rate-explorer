/**
 * Colorblind-safe, perceptually uniform color scales
 * Based on ColorBrewer and similar proven scales
 */

/**
 * Viridis-inspired colorblind-safe sequential scale
 * Purple (low) -> Teal -> Yellow (high)
 * Safe for most types of colorblindness
 */
export function getViridisColor(normalized: number): string {
  // Clamp between 0 and 1
  const t = Math.max(0, Math.min(1, normalized));

  // Viridis color scale approximation
  // Based on matplotlib's viridis
  const colors = [
    { r: 68, g: 1, b: 84 },      // 0.0 - Dark purple
    { r: 71, g: 44, b: 122 },    // 0.125
    { r: 59, g: 82, b: 139 },    // 0.25
    { r: 44, g: 113, b: 142 },   // 0.375
    { r: 33, g: 145, b: 140 },   // 0.5 - Teal
    { r: 39, g: 173, b: 129 },   // 0.625
    { r: 92, g: 200, b: 99 },    // 0.75
    { r: 170, g: 220, b: 50 },   // 0.875
    { r: 253, g: 231, b: 37 },   // 1.0 - Yellow
  ];

  // Find the two colors to interpolate between
  const index = t * (colors.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const fraction = index - lower;

  const c1 = colors[lower];
  const c2 = colors[upper];

  // Linear interpolation
  const r = Math.round(c1.r + (c2.r - c1.r) * fraction);
  const g = Math.round(c1.g + (c2.g - c1.g) * fraction);
  const b = Math.round(c1.b + (c2.b - c1.b) * fraction);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Yellow-Orange-Red colorblind-safe sequential scale
 * Yellow (low) -> Orange -> Red (high)
 * Good for showing intensity/heat
 */
export function getYellowOrangeRedColor(normalized: number): string {
  const t = Math.max(0, Math.min(1, normalized));

  const colors = [
    { r: 255, g: 255, b: 204 },  // 0.0 - Pale yellow
    { r: 255, g: 237, b: 160 },  // 0.2
    { r: 254, g: 217, b: 118 },  // 0.4
    { r: 254, g: 178, b: 76 },   // 0.6 - Orange
    { r: 253, g: 141, b: 60 },   // 0.8
    { r: 240, g: 59, b: 32 },    // 0.9
    { r: 189, g: 0, b: 38 },     // 1.0 - Dark red
  ];

  const index = t * (colors.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const fraction = index - lower;

  const c1 = colors[lower];
  const c2 = colors[upper];

  const r = Math.round(c1.r + (c2.r - c1.r) * fraction);
  const g = Math.round(c1.g + (c2.g - c1.g) * fraction);
  const b = Math.round(c1.b + (c2.b - c1.b) * fraction);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Blue-White-Red diverging scale
 * Blue (low) -> White (middle) -> Red (high)
 * Good when there's a meaningful midpoint
 */
export function getBlueWhiteRedColor(normalized: number): string {
  const t = Math.max(0, Math.min(1, normalized));

  if (t < 0.5) {
    // Blue to white
    const local = t * 2;
    const r = Math.round(33 + (255 - 33) * local);
    const g = Math.round(102 + (255 - 102) * local);
    const b = Math.round(172 + (255 - 172) * local);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // White to red
    const local = (t - 0.5) * 2;
    const r = 255;
    const g = Math.round(255 - 255 * local);
    const b = Math.round(255 - 213 * local);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/**
 * Get color based on selected color scheme
 */
export function getColorForRate(
  normalized: number,
  scheme: 'viridis' | 'heat' | 'diverging' = 'viridis'
): string {
  switch (scheme) {
    case 'viridis':
      return getViridisColor(normalized);
    case 'heat':
      return getYellowOrangeRedColor(normalized);
    case 'diverging':
      return getBlueWhiteRedColor(normalized);
    default:
      return getViridisColor(normalized);
  }
}

/**
 * Generate legend colors for a given scheme
 */
export function getLegendColors(
  steps: number = 20,
  scheme: 'viridis' | 'heat' | 'diverging' = 'viridis'
): string[] {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    return getColorForRate(t, scheme);
  });
}
