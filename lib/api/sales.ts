import type {
  PaymentMethodCreate,
  PaymentMethodRead,
  SaleItemCreate,
  SalesTransactionRead,
  SalesTransactionStatusUpdate,
} from "../types"
import { apiFetch } from "./base"

export function fetchPaymentMethods(): Promise<PaymentMethodRead[]> {
  return apiFetch("/payment-methods/")
}

export function fetchPaymentMethod(id: string): Promise<PaymentMethodRead> {
  return apiFetch(`/payment-methods/${id}`)
}

export function createPaymentMethod(data: PaymentMethodCreate): Promise<PaymentMethodRead> {
  return apiFetch("/payment-methods/", { method: "POST", body: JSON.stringify(data) })
}

export function fetchSales(): Promise<SalesTransactionRead[]> {
  return apiFetch("/sales/")
}

export function fetchSale(id: string): Promise<SalesTransactionRead> {
  return apiFetch(`/sales/${id}`)
}

export function createSale(items: SaleItemCreate[], paymentMethodId: string): Promise<SalesTransactionRead> {
  return apiFetch("/sales/", {
    method: "POST",
    body: JSON.stringify({ payment_method_id: paymentMethodId, items }),
  })
}

export function updateSaleStatus(id: string, data: SalesTransactionStatusUpdate): Promise<SalesTransactionRead> {
  return apiFetch(`/sales/${id}/status`, { method: "PATCH", body: JSON.stringify(data) })
}

export async function fetchSalesToday(): Promise<SalesTransactionRead[]> {
  const all = await fetchSales()
  const today = new Date().toISOString().slice(0, 10)
  return all.filter((s) => s.transaction_date.startsWith(today))
}
