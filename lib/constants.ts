import type { TransactionStatus } from "./types"

export const TRANSACTION_STATUS_LABEL: Record<TransactionStatus, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
}

export const TRANSACTION_STATUS_VARIANT: Record<
  TransactionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
  REFUNDED: "outline",
}
