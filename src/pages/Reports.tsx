import AppLayout from "@/components/AppLayout";
import { lots, sales, payments, developments, clients, LOT_STATUS_CONFIG, type LotStatus } from "@/data/mockData";
import { BarChart3, Download, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

type ReportTab = "disponibilidad" | "ventas" | "cobranza" | "asesores" | "cartera";

export default function Reports() {
  const [tab, setTab] = useState<ReportTab>("disponibilidad");

  const tabs: { key: ReportTab; label: string }[] = [
    { key: "disponibilidad", label: "Disponibilidad" },
    { key: "ventas", label: "Ventas" },
    { key: "cobranza", label: "Cobranza" },
    { key: "asesores", label: "Asesores" },
    { key: "cartera", label: "Cartera Vencida" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Reportes</h1>
            <p className="text-sm text-muted-foreground mt-1">Análisis y métricas del negocio</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card text-card-foreground px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-muted p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                tab === t.key
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "disponibilidad" && <AvailabilityReport />}
        {tab === "ventas" && <SalesReport />}
        {tab === "cobranza" && <CollectionReport />}
        {tab === "asesores" && <AdvisorReport />}
        {tab === "cartera" && <OverdueReport />}
      </div>
    </AppLayout>
  );
}

function AvailabilityReport() {
  const byDev = developments.map((d) => {
    const devLots = lots.filter((l) => l.developmentId === d.id);
    const counts: Partial<Record<LotStatus, number>> = {};
    devLots.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1; });
    return { dev: d, lots: devLots, counts };
  });

  return (
    <div className="space-y-4">
      {byDev.map(({ dev, lots: devLots, counts }) => (
        <div key={dev.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">{dev.name}</h3>
              <p className="text-xs text-muted-foreground">{dev.location} · {devLots.length} lotes</p>
            </div>
            <span className="text-xs font-medium bg-accent text-accent-foreground px-2.5 py-1 rounded-full">
              {dev.soldLots}/{dev.totalLots} vendidos
            </span>
          </div>
          {/* Status bar */}
          <div className="flex rounded-lg overflow-hidden h-5 mb-3">
            {(Object.entries(counts) as [LotStatus, number][]).map(([status, count]) => (
              <div
                key={status}
                className={LOT_STATUS_CONFIG[status].twClass}
                style={{ width: `${(count / devLots.length) * 100}%` }}
                title={`${LOT_STATUS_CONFIG[status].label}: ${count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(counts) as [LotStatus, number][]).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`inline-block h-2 w-2 rounded-full ${LOT_STATUS_CONFIG[status].twClass}`} />
                {LOT_STATUS_CONFIG[status].label}: {count}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SalesReport() {
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((s, v) => s + v.totalPrice, 0);
  const totalCollected = sales.reduce((s, v) => s + v.paidAmount, 0);
  const activeSales = sales.filter((s) => s.status === "activa").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Ventas", value: totalSales },
          { label: "Valor Total", value: formatCurrency(totalRevenue) },
          { label: "Cobrado", value: formatCurrency(totalCollected) },
          { label: "Ventas Activas", value: activeSales },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
            <p className="text-xl font-display font-bold text-card-foreground">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Venta", "Cliente", "Lote", "Desarrollo", "Fecha", "Total", "Pagado", "Saldo", "Estatus"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.id}</td>
                <td className="px-4 py-3 font-medium text-card-foreground">{s.clientName}</td>
                <td className="px-4 py-3 text-muted-foreground">Lote {s.lotNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.developmentName}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.saleDate}</td>
                <td className="px-4 py-3 font-semibold text-card-foreground">{formatCurrency(s.totalPrice)}</td>
                <td className="px-4 py-3 text-card-foreground">{formatCurrency(s.paidAmount)}</td>
                <td className="px-4 py-3 text-card-foreground">{formatCurrency(s.pendingBalance)}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
                    s.status === "activa" ? "bg-lot-financed/20 text-lot-financed" :
                    s.status === "liquidada" ? "bg-lot-available/20 text-lot-available" :
                    "bg-destructive/20 text-destructive"
                  )}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CollectionReport() {
  const totalPayments = payments.length;
  const totalAmount = payments.filter((p) => p.status === "aplicado").reduce((s, p) => s + p.amount, 0);
  const byMethod: Record<string, number> = {};
  payments.forEach((p) => { if (p.status === "aplicado") byMethod[p.method] = (byMethod[p.method] || 0) + p.amount; });
  const byType: Record<string, number> = {};
  payments.forEach((p) => { if (p.status === "aplicado") byType[p.type] = (byType[p.type] || 0) + p.amount; });

  const methodLabels: Record<string, string> = { transferencia: "Transferencia", deposito: "Depósito", cheque: "Cheque", efectivo: "Efectivo", tarjeta: "Tarjeta" };
  const typeLabels: Record<string, string> = { enganche: "Enganche", mensualidad: "Mensualidad", abono_capital: "Abono a capital", extraordinario: "Extraordinario" };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Total Pagos</p>
          <p className="text-xl font-display font-bold text-card-foreground">{totalPayments}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Monto Cobrado</p>
          <p className="text-xl font-display font-bold text-card-foreground">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Métodos Usados</p>
          <p className="text-xl font-display font-bold text-card-foreground">{Object.keys(byMethod).length}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Por Método de Pago</h3>
          <div className="space-y-3">
            {Object.entries(byMethod).map(([method, amount]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{methodLabels[method] || method}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(amount / totalAmount) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-card-foreground w-28 text-right">{formatCurrency(amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Por Tipo de Pago</h3>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, amount]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{typeLabels[type] || type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-accent-foreground" style={{ width: `${(amount / totalAmount) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-card-foreground w-28 text-right">{formatCurrency(amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvisorReport() {
  const advisors: Record<string, { sales: number; totalValue: number; collected: number }> = {};
  lots.forEach((l) => {
    if (l.advisorName) {
      if (!advisors[l.advisorName]) advisors[l.advisorName] = { sales: 0, totalValue: 0, collected: 0 };
      advisors[l.advisorName].sales += 1;
      advisors[l.advisorName].totalValue += l.basePrice;
      advisors[l.advisorName].collected += l.basePrice - (l.pendingBalance || 0);
    }
  });

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {["Asesor", "Lotes Asignados", "Valor Total", "Cobrado", "Comisión Est. (3%)"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(advisors).map(([name, data]) => (
            <tr key={name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-medium text-card-foreground">{name}</td>
              <td className="px-4 py-3 text-muted-foreground">{data.sales}</td>
              <td className="px-4 py-3 text-card-foreground">{formatCurrency(data.totalValue)}</td>
              <td className="px-4 py-3 text-card-foreground">{formatCurrency(data.collected)}</td>
              <td className="px-4 py-3 font-semibold text-card-foreground">{formatCurrency(data.collected * 0.03)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverdueReport() {
  const overdueSales = sales.filter((s) => s.status === "activa" && s.pendingBalance > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Cuentas en Mora</p>
          <p className="text-xl font-display font-bold text-destructive">{overdueSales.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Saldo Vencido Total</p>
          <p className="text-xl font-display font-bold text-destructive">{formatCurrency(overdueSales.reduce((s, v) => s + v.pendingBalance, 0))}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Próximo Vencimiento</p>
          <p className="text-xl font-display font-bold text-card-foreground">{overdueSales[0]?.nextPaymentDate || "—"}</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Cliente", "Lote", "Saldo Pendiente", "Próx. Pago", "Riesgo"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overdueSales.map((s) => {
              const ratio = s.paidAmount / s.totalPrice;
              const risk = ratio < 0.3 ? "Alto" : ratio < 0.6 ? "Medio" : "Bajo";
              const riskClass = risk === "Alto" ? "bg-destructive/20 text-destructive" : risk === "Medio" ? "bg-lot-separated/20 text-lot-separated" : "bg-lot-available/20 text-lot-available";
              return (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-card-foreground">{s.clientName}</td>
                  <td className="px-4 py-3 text-muted-foreground">Lote {s.lotNumber}</td>
                  <td className="px-4 py-3 font-semibold text-destructive">{formatCurrency(s.pendingBalance)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.nextPaymentDate}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", riskClass)}>{risk}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
