"use client"

import { useEffect, useState, useTransition } from "react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useProductsPage } from "@/lib/queries"
import type { CategoryRead, ProductListParams, ProductListResponse } from "@/lib/types"
import {
  ALL_CATEGORIES_VALUE,
  ALL_STATUSES_VALUE,
  ProductListFilters,
  type ProductStatusFilterValue,
} from "@/components/products/product-list-filters"
import { PRODUCTS_PAGE_SIZE } from "@/components/products/products-list.constants"
import { ProductTable } from "@/components/products/product-table"
import { Button } from "@/components/ui/button"

interface ProductsContainerProps {
  categories: CategoryRead[]
  initialPage: ProductListResponse
}

export function ProductsContainer({ categories, initialPage }: ProductsContainerProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [, startRefreshTransition] = useTransition()
  const [nameInput, setNameInput] = useState("")
  const [debouncedName, setDebouncedName] = useState("")
  const [categoryValue, setCategoryValue] = useState(ALL_CATEGORIES_VALUE)
  const [statusValue, setStatusValue] = useState<ProductStatusFilterValue>(ALL_STATUSES_VALUE)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedName(nameInput.trim())
      setOffset(0)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [nameInput])

  const params: ProductListParams = {
    name: debouncedName || undefined,
    category_id: categoryValue === ALL_CATEGORIES_VALUE ? undefined : categoryValue,
    is_active:
      statusValue === ALL_STATUSES_VALUE ? undefined : statusValue === "true",
    limit: PRODUCTS_PAGE_SIZE,
    offset,
    include_stock: true,
    include_price: true,
  }

  const isInitialQuery =
    !debouncedName &&
    categoryValue === ALL_CATEGORIES_VALUE &&
    statusValue === ALL_STATUSES_VALUE &&
    offset === 0

  const { data, isError, isFetching, refetch } = useProductsPage(
    params,
    isInitialQuery ? initialPage : undefined
  )

  const products = data?.items ?? initialPage.items
  const hasFilters =
    debouncedName.length > 0 ||
    categoryValue !== ALL_CATEGORIES_VALUE ||
    statusValue !== ALL_STATUSES_VALUE
  const emptyMessage = hasFilters
    ? "No se encontraron productos con los filtros aplicados"
    : "No hay productos registrados"
  const pagination = data ?? initialPage

  async function handleDeleted() {
    await queryClient.invalidateQueries({ queryKey: ["productsPage"] })
    await queryClient.invalidateQueries({ queryKey: ["products"] })
    startRefreshTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <ProductListFilters
        categories={categories}
        searchValue={nameInput}
        categoryValue={categoryValue}
        statusValue={statusValue}
        onSearchValueChange={setNameInput}
        onCategoryValueChange={(value) => {
          setCategoryValue(value)
          setOffset(0)
        }}
        onStatusValueChange={(value) => {
          setStatusValue(value)
          setOffset(0)
        }}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            {pagination.total} producto{pagination.total !== 1 ? "s" : ""}
          </span>
          {isFetching && <span>Actualizando resultados...</span>}
        </div>

        {isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
            <p className="text-destructive">No se pudieron cargar los productos.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        )}

        <ProductTable
          products={products}
          emptyMessage={emptyMessage}
          onDeleted={handleDeleted}
        />

        {pagination.total_pages > 1 && (
          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Página {pagination.current_page} de {pagination.total_pages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset((currentOffset) => currentOffset - pagination.limit)}
                disabled={pagination.current_page === 1 || isFetching}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset((currentOffset) => currentOffset + pagination.limit)}
                disabled={pagination.current_page === pagination.total_pages || isFetching}
              >
                Siguiente
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
