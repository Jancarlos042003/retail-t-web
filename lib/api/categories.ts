import type { CategoryCreate, CategoryRead, CategoryUpdate } from "../types"
import { apiFetch } from "./base"

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
