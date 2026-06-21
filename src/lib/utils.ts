import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Returns true if the URL points to a Cloudinary video or a known video extension. */
export function isMediaVideo(url: string): boolean {
  return /\/video\/upload\//i.test(url) || /\.(mp4|webm|mov|ogg|avi)(\?|$)/i.test(url);
}

export interface PasswordCheck {
  label: string;
  pass: boolean;
}

/** Returns an array of requirement checks for a password. */
export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: "6+ characters", pass: password.length >= 6 },
    { label: "Uppercase (A–Z)", pass: /[A-Z]/.test(password) },
    { label: "Lowercase (a–z)", pass: /[a-z]/.test(password) },
    { label: "Number (0–9)", pass: /[0-9]/.test(password) },
    { label: "Symbol (!@#…)", pass: /[^A-Za-z0-9]/.test(password) },
  ];
}

/** Returns the first failing password rule message, or null if all pass. */
export function validatePassword(password: string): string | null {
  for (const c of getPasswordChecks(password)) {
    if (!c.pass) return c.label + " required";
  }
  return null;
}
