import { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Since this environment can't easily add dependencies, we use a more direct `cn`
// implementation that relies on the globally available `clsx` and `tailwind-merge`
// if they were loaded, or falls back to a simpler join.
// With Vite, these will be bundled correctly.
import realClsx from 'clsx';
import realTwMerge from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return realTwMerge(realClsx(inputs));
}
