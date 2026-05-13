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

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—"

  const amount =
    typeof value === "string" ? Number.parseFloat(value) : value

  if (!Number.isFinite(amount)) return "—"

  return `S/ ${amount.toFixed(2)}`
}
