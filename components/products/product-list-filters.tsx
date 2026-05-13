"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { CategoryRead } from "@/lib/types"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const ALL_CATEGORIES_VALUE = "all-categories"
export const ALL_STATUSES_VALUE = "all-statuses"

export type ProductStatusFilterValue = typeof ALL_STATUSES_VALUE | "true" | "false"

interface ProductListFiltersProps {
  categories: CategoryRead[]
  searchValue: string
  categoryValue: string
  statusValue: ProductStatusFilterValue
  onSearchValueChange: (value: string) => void
  onCategoryValueChange: (value: string) => void
  onStatusValueChange: (value: ProductStatusFilterValue) => void
}

export function ProductListFilters({
  categories,
  searchValue,
  categoryValue,
  statusValue,
  onSearchValueChange,
  onCategoryValueChange,
  onStatusValueChange,
}: ProductListFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Buscar producto..."
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={categoryValue} onValueChange={onCategoryValueChange}>
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES_VALUE}>Todas las categorías</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusValue} onValueChange={onStatusValueChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUSES_VALUE}>Todos</SelectItem>
          <SelectItem value="true">Activos</SelectItem>
          <SelectItem value="false">Inactivos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
