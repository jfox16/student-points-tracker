import { twMerge } from "tailwind-merge";

export const cnsMerge = (...args: Parameters<typeof twMerge>) => {
  return twMerge(...args);
};