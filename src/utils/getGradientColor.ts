/**
 * Generates a color by interpolating between given gradient stops.
 * The stops are evenly distributed from min to max.
 * @param value The input value.
 * @param min The minimum expected value.
 * @param max The maximum expected value.
 * @param stops An array of RGB colors to interpolate between.
 * @returns The interpolated RGB color as a string.
 */
export const getGradientColor = (
  value: number,
  min: number,
  max: number,
  stops: [number, number, number][]
) => {
  if (value < min) value = min;
  if (value > max) value = max;

  const totalStops = stops.length - 1;
  const segmentSize = (max - min) / totalStops; // Size of each color segment
  const position = (value - min) / segmentSize;
  const index = Math.floor(position);
  const factor = position - index; // Interpolation factor between stops

  if (index >= totalStops) return `rgb(${stops[totalStops].join(",")})`;

  const [r1, g1, b1] = stops[index];
  const [r2, g2, b2] = stops[index + 1];

  const red = Math.round(r1 + (r2 - r1) * factor);
  const green = Math.round(g1 + (g2 - g1) * factor);
  const blue = Math.round(b1 + (b2 - b1) * factor);

  return `rgb(${red}, ${green}, ${blue})`;
}
