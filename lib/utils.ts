import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-PE")
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
}
