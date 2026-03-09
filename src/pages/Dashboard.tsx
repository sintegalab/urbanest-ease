import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import { dashboardStats, developments, sales, lots, LOT_STATUS_CONFIG, type LotStatus } from "@/data/mockData";
import { Building2, MapPin, DollarSign, AlertTriangle, TrendingUp, Users, ShoppingCart, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

function LotStatusBar() {
  const counts: Record<LotStatus, number> = {} as any;
  lots.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1; });
  const total = lots.length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">Distribución de Lotes</h3>
      <div className="flex rounded-lg overflow-hidden h-6 mb-4">
        {(Object.entries(counts) as [LotStatus, number][]).map(([status, count]) => (
          <div
            key={status}
            className={LOT_STATUS_CONFIG[status].twClass}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${LOT_STATUS_CONFIG[status].label}: ${count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {(Object.entries(counts) as [LotStatus, number][]).map(([status, count]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${LOT_STATUS_CONFIG[status].twClass}`} />
            {LOT_STATUS_CONFIG[status].label} ({count})
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentSales() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">Ventas Recientes</h3>
      <div className="space-y-3">
        {sales.map((s) => (
          <div key={s.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-card-foreground">Lote {s.lotNumber} — {s.clientName}</p>
              <p className="text-xs text-muted-foreground">{s.developmentName} · {s.saleDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-card-foreground">{formatCurrency(s.totalPrice)}</p>
              <p className="text-xs text-muted-foreground">{s.status === 'liquidada' ? 'Liquidada' : formatCurrency(s.pendingBalance) + ' pend.'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DevelopmentsList() {
  const navigate = useNavigate();
  const statusLabels: Record<string, string> = {
    planeacion: 'Planeación', preventa: 'Preventa', venta_activa: 'Venta activa', liquidado: 'Liquidado', suspendido: 'Suspendido',
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">Desarrollos</h3>
      <div className="space-y-3">
        {developments.map((d) => (
          <div
            key={d.id}
            onClick={() => navigate(`/mapa/${d.id}`)}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.location}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-card-foreground">{d.soldLots}/{d.totalLots}</p>
              <p className="text-xs text-muted-foreground">{statusLabels[d.status]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumen general del sistema inmobiliario</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Lotes Totales" value={dashboardStats.totalLots} subtitle={`${dashboardStats.availableLots} disponibles`} icon={<MapPin className="h-5 w-5" />} />
          <StatCard title="Lotes Vendidos" value={dashboardStats.soldLots} icon={<ShoppingCart className="h-5 w-5" />} trend={{ value: "+3 este mes", positive: true }} />
          <StatCard title="Ingreso Mensual" value={formatCurrency(dashboardStats.monthlyIncome)} icon={<DollarSign className="h-5 w-5" />} trend={{ value: "+12% vs. mes anterior", positive: true }} />
          <StatCard title="Cartera Vencida" value={formatCurrency(dashboardStats.overdueAmount)} subtitle={`${dashboardStats.overdueClients} clientes`} icon={<AlertTriangle className="h-5 w-5" />} />
        </div>

        <LotStatusBar />

        <div className="grid gap-4 lg:grid-cols-2">
          <DevelopmentsList />
          <RecentSales />
        </div>
      </div>
    </AppLayout>
  );
}
