import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prefix a public/ path with Vite's base so it resolves when the site is served
 * from a subpath (GitHub Pages). Vite only rewrites URLs it sees in index.html,
 * not strings built at runtime, so anything under public/ referenced from JSX or
 * a template literal has to go through here.
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  return `${base}${path.replace(/^\//, "")}`;
}
