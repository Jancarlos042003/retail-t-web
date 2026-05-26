import type {
  ProductFormData,
  ProductListParams,
  ProductListResponse,
  ProductPriceCreate,
  ProductPriceRead,
  ProductRead,
  ProductReadWithCategory,
  ProductReadWithMetrics,
  ProductUpdate,
} from "../types"
import { apiFetch, apiFetchForm } from "./base"

function buildProductsPath(params: ProductListParams = {}) {
  const qs = new URLSearchParams()
  const name = params.name?.trim()

  if (name) qs.set("name", name)
  if (params.category_id) qs.set("category_id", params.category_id)
  if (params.is_active !== undefined) qs.set("is_active", String(params.is_active))
  if (params.include_stock) qs.set("include_stock", "true")
  if (params.include_price) qs.set("include_price", "true")
  if (params.limit !== undefined) qs.set("limit", String(params.limit))
  if (params.offset !== undefined) qs.set("offset", String(params.offset))

  const query = qs.toString()
  return query ? `/products/?${query}` : "/products/"
}

export function fetchProductsPage(params: ProductListParams = {}): Promise<ProductListResponse> {
  return apiFetch(buildProductsPath(params))
}

export function fetchProducts(
  isActive?: boolean,
  options?: Pick<ProductListParams, "include_stock" | "include_price">,
): Promise<ProductReadWithMetrics[]> {
  return fetchAllProducts({ is_active: isActive, ...options })
}

export function fetchProduct(id: string): Promise<ProductReadWithCategory> {
  return apiFetch(`/products/${id}`)
}

export function createProduct(data: ProductFormData): Promise<ProductRead> {
  const form = new FormData()
  form.append("barcode", data.barcode)
  form.append("name", data.name)
  form.append("category_id", data.category_id)
  form.append("min_stock", String(data.min_stock))
  form.append("is_active", String(data.is_active))
  if (data.image) form.append("image", data.image)
  return apiFetchForm<ProductRead>("/products/", form)
}

export function updateProduct(id: string, data: ProductUpdate): Promise<ProductReadWithCategory> {
  return apiFetch(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) })
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch(`/products/${id}`, { method: "DELETE" })
}

export function fetchPriceHistory(productId: string): Promise<ProductPriceRead[]> {
  return apiFetch(`/products/${productId}/prices/`)
}

export function fetchCurrentPrice(productId: string): Promise<ProductPriceRead> {
  return apiFetch(`/products/${productId}/prices/current`)
}

export function setPrice(productId: string, data: ProductPriceCreate): Promise<ProductPriceRead> {
  return apiFetch(`/products/${productId}/prices/`, { method: "POST", body: JSON.stringify(data) })
}

async function fetchAllProducts(
  params: Omit<ProductListParams, "limit" | "offset"> = {},
): Promise<ProductReadWithMetrics[]> {
  const firstPage = await fetchProductsPage({ ...params, limit: 100, offset: 0 })

  if (firstPage.total_pages <= 1) {
    return firstPage.items
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.total_pages - 1 }, (_, index) =>
      fetchProductsPage({
        ...params,
        limit: firstPage.limit,
        offset: firstPage.limit * (index + 1),
      })
    )
  )

  return [firstPage, ...remainingPages].flatMap((page) => page.items)
}
