import type { SalesTransactionRead } from "@/lib/types"
import { TRANSACTION_STATUS_LABEL, TRANSACTION_STATUS_VARIANT } from "@/lib/constants"
import { formatTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SalesTableProps {
  sales: SalesTransactionRead[]
}

export function SalesTable({ sales }: SalesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hora</TableHead>
          <TableHead>Método de pago</TableHead>
          <TableHead>Productos</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
              No hay ventas registradas hoy
            </TableCell>
          </TableRow>
        )}
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell className="text-sm">{formatTime(sale.transaction_date)}</TableCell>
            <TableCell>{sale.payment_method_rel.name}</TableCell>
            <TableCell>
              <div className="space-y-0.5">
                {sale.items.map((item) => (
                  <p key={item.id} className="text-sm">
                    {item.product_name_snapshot}{" "}
                    <span className="text-muted-foreground">× {item.quantity}</span>
                  </p>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={TRANSACTION_STATUS_VARIANT[sale.status]}>
                {TRANSACTION_STATUS_LABEL[sale.status] ?? sale.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-semibold">
              S/ {parseFloat(sale.total_amount).toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
