export interface CategoryRead {
  id: string
  name: string
}

export interface CategoryCreate {
  name: string
}

export interface CategoryUpdate {
  name?: string | null
}

export interface ProductRead {
  id: string
  barcode: string
  name: string
  category_id: string
  image_url?: string | null
  min_stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductReadWithCategory extends ProductRead {
  category: CategoryRead
}

export interface ProductUpdate {
  barcode?: string | null
  name?: string | null
  category_id?: string | null
  image_url?: string | null
  min_stock?: number | null
  is_active?: boolean | null
}

export interface ProductPriceRead {
  id: string
  product_id: string
  selling_price: string
  effective_to?: string | null
}

export interface ProductPriceCreate {
  selling_price: number | string
}

export interface StockLevelRead {
  product_id: string
  quantity: number
  updated_at: string
}

export interface StockMovementRead {
  id: string
  product_id: string
  type_id: string
  quantity: number
  reason?: string | null
  created_at: string
}

export interface StockMovementCreate {
  product_id: string
  type_id: string
  quantity: number
  reason?: string | null
}

export interface MovementTypeRead {
  id: string
  code: string
  name: string
  operation: "IN" | "OUT"
}

export interface PaymentMethodRead {
  id: string
  name: string
}

export interface PaymentMethodCreate {
  name: string
}

export interface SaleItemRead {
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  unit_price: string
  subtotal: string
  product_name_snapshot: string
}

export interface SaleItemCreate {
  product_id: string
  quantity: number
}

export type TransactionStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED"

export interface SalesTransactionRead {
  id: string
  transaction_date: string
  total_amount: string
  status: TransactionStatus
  payment_method_rel: PaymentMethodRead
  items: SaleItemRead[]
}

export interface SalesTransactionCreate {
  payment_method_id: string
  items: SaleItemCreate[]
}

export interface SalesTransactionStatusUpdate {
  status: TransactionStatus
}

export interface StorageUploadRead {
  object_name: string
  public_url: string
}

export interface ProductFormData {
  barcode: string
  name: string
  category_id: string
  min_stock: number
  is_active: boolean
  image?: File | null
}
