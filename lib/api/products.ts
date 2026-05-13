import type {
  ProductFormData,
  ProductPriceCreate,
  ProductPriceRead,
  ProductRead,
  ProductReadWithCategory,
  ProductUpdate,
} from "../types"
import { apiFetch, apiFetchForm } from "./base"

export function fetchProducts(isActive?: boolean): Promise<ProductReadWithCategory[]> {
  const query = isActive !== undefined ? `?is_active=${isActive}` : ""
  return apiFetch(`/products/${query}`)
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
