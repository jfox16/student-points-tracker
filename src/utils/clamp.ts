export const clamp = (value: number = 0, min?: number, max?: number): number => {
  if (min !== undefined) value = Math.max(value, min);
  if (max !== undefined) value = Math.min(value, max);
  return value;
};