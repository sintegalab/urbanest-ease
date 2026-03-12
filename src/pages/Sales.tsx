import AppLayout from "@/components/AppLayout";
import { sales, generateAmortization, type Sale, type AmortizationRow } from "@/data/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

const statusStyles: Record<string, string> = {
  activa: "bg-lot-available/20 text-lot-available",
  liquidada: "bg-lot-settled/20 text-lot-settled",
  cancelada: "bg-destructive/20 text-destructive",
  reestructurada: "bg-lot-reserved/20 text-lot-reserved",
};

const payStatusStyles: Record<string, string> = {
  pagado: "bg-lot-available/20 text-lot-available",
  pendiente: "bg-lot-reserved/20 text-lot-reserved",
  vencido: "bg-destructive/20 text-destructive",
  parcial: "bg-lot-separated/20 text-lot-separated",
};

function AmortizationTable({ sale }: { sale: Sale }) {
  const rows = generateAmortization(sale);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            {["#", "Vencimiento", "Saldo Inicial", "Capital", "Interés", "Recargo", "Total", "Saldo Final", "Estatus"].map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.number} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-semibold text-card-foreground">{row.number}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.dueDate}</td>
              <td className="px-3 py-2 text-muted-foreground">{formatCurrency(row.openingBalance)}</td>
              <td className="px-3 py-2 text-card-foreground">{formatCurrency(row.principal)}</td>
              <td className="px-3 py-2 text-muted-foreground">{formatCurrency(row.interest)}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.surcharge > 0 ? formatCurrency(row.surcharge) : "—"}</td>
              <td className="px-3 py-2 font-semibold text-card-foreground">{formatCurrency(row.totalDue)}</td>
              <td className="px-3 py-2 text-muted-foreground">{formatCurrency(row.closingBalance)}</td>
              <td className="px-3 py-2">
                <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", payStatusStyles[row.status])}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Sales() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Ventas</h1>
            <p className="text-sm text-muted-foreground mt-1">{sales.length} operaciones registradas</p>
          </div>
          <button onClick={() => navigate("/ventas/nueva")} className="rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
            + Nueva Venta
          </button>
        </div>

        <div className="space-y-3">
          {sales.map((sale) => {
            const isExpanded = expanded === sale.id;
            return (
              <div key={sale.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : sale.id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-display font-bold text-card-foreground">Lote {sale.lotNumber} — {sale.clientName}</p>
                      <p className="text-xs text-muted-foreground">{sale.developmentName} · {sale.saleDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-card-foreground">{formatCurrency(sale.totalPrice)}</p>
                      <p className="text-xs text-muted-foreground">Saldo: {formatCurrency(sale.pendingBalance)}</p>
                    </div>
                    <span className={cn("text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full", statusStyles[sale.status])}>
                      {sale.status}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-muted/20">
                      {[
                        { label: "Enganche", value: formatCurrency(sale.downPayment) },
                        { label: "Mensualidad", value: formatCurrency(sale.monthlyPayment) },
                        { label: "Plazo", value: `${sale.term} meses` },
                        { label: "Tasa", value: `${sale.interestRate}%` },
                        { label: "Pagado", value: formatCurrency(sale.paidAmount) },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</p>
                          <p className="text-sm font-semibold text-card-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Amortization */}
                    <AmortizationTable sale={sale} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
