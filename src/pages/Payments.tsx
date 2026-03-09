import AppLayout from "@/components/AppLayout";
import { payments, sales } from "@/data/mockData";
import { cn } from "@/lib/utils";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

const methodLabels: Record<string, string> = {
  transferencia: "Transferencia",
  deposito: "Depósito",
  cheque: "Cheque",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
};

const typeLabels: Record<string, string> = {
  enganche: "Enganche",
  mensualidad: "Mensualidad",
  abono_capital: "Abono a capital",
  extraordinario: "Extraordinario",
};

export default function Payments() {
  // Enrich payments with sale info
  const enriched = payments.map((p) => {
    const sale = sales.find((s) => s.id === p.saleId);
    return { ...p, clientName: sale?.clientName || "", lotNumber: sale?.lotNumber || "" };
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Pagos</h1>
            <p className="text-sm text-muted-foreground mt-1">Registro de cobranza y abonos</p>
          </div>
          <button className="rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
            + Registrar Pago
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Fecha", "Cliente", "Lote", "Tipo", "Monto", "Método", "Referencia", "Estatus"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-3 font-medium text-card-foreground">{p.clientName}</td>
                  <td className="px-4 py-3 text-muted-foreground">Lote {p.lotNumber}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      {typeLabels[p.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-card-foreground">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{methodLabels[p.method]}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.reference}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
                      p.status === "aplicado" ? "bg-lot-available/20 text-lot-available" : "bg-destructive/20 text-destructive"
                    )}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
