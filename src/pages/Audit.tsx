import AppLayout from "@/components/AppLayout";
import { auditLogs } from "@/data/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Filter, Download } from "lucide-react";

const moduleColors: Record<string, string> = {
  Lotes: "bg-lot-separated/20 text-lot-separated",
  Pagos: "bg-lot-available/20 text-lot-available",
  Ventas: "bg-lot-financed/20 text-lot-financed",
  Clientes: "bg-accent text-accent-foreground",
  Cobranza: "bg-destructive/20 text-destructive",
};

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  ventas: "Ventas",
  cobranza: "Cobranza",
  administracion: "Administración",
  sistema: "Sistema",
};

export default function Audit() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("todos");

  const modules = ["todos", ...Array.from(new Set(auditLogs.map((l) => l.module)))];

  const filtered = auditLogs.filter((l) => {
    const matchesSearch = search === "" || 
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.detail.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "todos" || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Auditoría</h1>
            <p className="text-sm text-muted-foreground mt-1">Bitácora de acciones y cambios del sistema</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card text-card-foreground px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por usuario, acción o detalle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1 rounded-lg bg-muted p-1 overflow-x-auto">
            {modules.map((m) => (
              <button
                key={m}
                onClick={() => setModuleFilter(m)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                  moduleFilter === m
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "todos" ? "Todos" : m}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Registros Totales</p>
            <p className="text-xl font-display font-bold text-card-foreground">{auditLogs.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Hoy</p>
            <p className="text-xl font-display font-bold text-card-foreground">
              {auditLogs.filter((l) => l.date === "2026-03-09").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Usuarios Activos</p>
            <p className="text-xl font-display font-bold text-card-foreground">
              {new Set(auditLogs.map((l) => l.user)).size}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Acciones Críticas</p>
            <p className="text-xl font-display font-bold text-destructive">
              {auditLogs.filter((l) => ["Cancelación de venta", "Descuento extraordinario", "Cambio de precio de lote"].includes(l.action)).length}
            </p>
          </div>
        </div>

        {/* Log entries */}
        <div className="space-y-3">
          {filtered.map((log) => (
            <div key={log.id} className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-card-foreground">{log.action}</span>
                    <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", moduleColors[log.module] || "bg-muted text-muted-foreground")}>
                      {log.module}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{log.detail}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium text-card-foreground">{log.user}</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{roleLabels[log.role] || log.role}</span>
                    <span>{log.entity}</span>
                    <span className="font-mono">{log.ip}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-card-foreground">{log.date}</p>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No se encontraron registros.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
