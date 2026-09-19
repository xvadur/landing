import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Spája Tailwind triedy bez duplicít (shadcn konvencia). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
