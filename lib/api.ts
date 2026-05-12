import type {
  CategoryCreate,
  CategoryRead,
  CategoryUpdate,
  MovementTypeRead,
  PaymentMethodCreate,
  PaymentMethodRead,
  ProductFormData,
  ProductPriceCreate,
  ProductPriceRead,
  ProductRead,
  ProductReadWithCategory,
  ProductUpdate,
  SaleItemCreate,
  SalesTransactionRead,
  SalesTransactionStatusUpdate,
  StockLevelRead,
  StockMovementCreate,
  StockMovementRead,
  StorageUploadRead,
  TransactionStatus,
} from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API error ${res.status}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// --- Categories ---

export function fetchCategories(): Promise<CategoryRead[]> {
  return apiFetch("/categories/")
}

export function fetchCategory(id: string): Promise<CategoryRead> {
  return apiFetch(`/categories/${id}`)
}

export function createCategory(data: CategoryCreate): Promise<CategoryRead> {
  return apiFetch("/categories/", { method: "POST", body: JSON.stringify(data) })
}

export function updateCategory(id: string, data: CategoryUpdate): Promise<CategoryRead> {
  return apiFetch(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) })
}

export function deleteCategory(id: string): Promise<void> {
  return apiFetch(`/categories/${id}`, { method: "DELETE" })
}

// --- Products ---

export function fetchProducts(isActive?: boolean): Promise<ProductReadWithCategory[]> {
  const query = isActive !== undefined ? `?is_active=${isActive}` : ""
  return apiFetch(`/products/${query}`)
}

export function fetchProduct(id: string): Promise<ProductReadWithCategory> {
  return apiFetch(`/products/${id}`)
}

export async function createProduct(data: ProductFormData): Promise<ProductRead> {
  const form = new FormData()
  form.append("barcode", data.barcode)
  form.append("name", data.name)
  form.append("category_id", data.category_id)
  form.append("min_stock", String(data.min_stock))
  form.append("is_active", String(data.is_active))
  if (data.image) form.append("image", data.image)

  const res = await fetch(`${BASE_URL}/products/`, { method: "POST", body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<ProductRead>
}

export function updateProduct(id: string, data: ProductUpdate): Promise<ProductReadWithCategory> {
  return apiFetch(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) })
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch(`/products/${id}`, { method: "DELETE" })
}

// --- Prices ---

export function fetchPriceHistory(productId: string): Promise<ProductPriceRead[]> {
  return apiFetch(`/products/${productId}/prices/`)
}

export function fetchCurrentPrice(productId: string): Promise<ProductPriceRead> {
  return apiFetch(`/products/${productId}/prices/current`)
}

export function setPrice(productId: string, data: ProductPriceCreate): Promise<ProductPriceRead> {
  return apiFetch(`/products/${productId}/prices/`, { method: "POST", body: JSON.stringify(data) })
}

// --- Stock ---

export function fetchMovementTypes(): Promise<MovementTypeRead[]> {
  return apiFetch("/stock/movement-types")
}

export function fetchStockLevel(productId: string): Promise<StockLevelRead> {
  return apiFetch(`/stock/${productId}`)
}

export function fetchStockMovements(productId: string): Promise<StockMovementRead[]> {
  return apiFetch(`/stock/${productId}/movements`)
}

export function createStockMovement(data: StockMovementCreate): Promise<StockMovementRead> {
  return apiFetch("/stock/movements", { method: "POST", body: JSON.stringify(data) })
}

// --- Payment Methods ---

export function fetchPaymentMethods(): Promise<PaymentMethodRead[]> {
  return apiFetch("/payment-methods/")
}

export function fetchPaymentMethod(id: string): Promise<PaymentMethodRead> {
  return apiFetch(`/payment-methods/${id}`)
}

export function createPaymentMethod(data: PaymentMethodCreate): Promise<PaymentMethodRead> {
  return apiFetch("/payment-methods/", { method: "POST", body: JSON.stringify(data) })
}

// --- Sales ---

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

// --- Storage ---

export async function uploadImage(file: File): Promise<StorageUploadRead> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch(`${BASE_URL}/storage/upload`, { method: "POST", body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Upload error ${res.status}: ${text}`)
  }
  return res.json() as Promise<StorageUploadRead>
}

// --- Sales today helper (filter by today's date) ---

export async function fetchSalesToday(): Promise<SalesTransactionRead[]> {
  const all = await fetchSales()
  const today = new Date().toISOString().slice(0, 10)
  return all.filter((s) => s.transaction_date.startsWith(today))
}

export async function fetchLowStockProducts(): Promise<
  (ProductReadWithCategory & { stock_quantity: number })[]
> {
  const products = await fetchProducts(true)
  const stockResults = await Promise.allSettled(
    products.map((p) => fetchStockLevel(p.id).then((s) => ({ ...p, stock_quantity: s.quantity })))
  )
  return stockResults
    .filter((r): r is PromiseFulfilledResult<ProductReadWithCategory & { stock_quantity: number }> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((p) => p.stock_quantity <= p.min_stock)
}

export async function fetchDashboardMetrics() {
  const [salesToday, products] = await Promise.all([fetchSalesToday(), fetchProducts(true)])

  const totalRevenue = salesToday
    .filter((s) => s.status === "COMPLETED")
    .reduce((acc, s) => acc + parseFloat(s.total_amount), 0)

  const stockResults = await Promise.allSettled(products.map((p) => fetchStockLevel(p.id)))
  const stocks = stockResults
    .filter((r): r is PromiseFulfilledResult<StockLevelRead> => r.status === "fulfilled")
    .map((r) => r.value)

  const lowStockCount = products.filter((p) => {
    const stock = stocks.find((s) => s.product_id === p.id)
    return stock !== undefined && stock.quantity <= p.min_stock
  }).length

  return {
    total_sales_today: salesToday.filter((s) => s.status === "COMPLETED").length,
    total_revenue_today: totalRevenue,
    low_stock_count: lowStockCount,
    total_products: products.length,
  }
}
