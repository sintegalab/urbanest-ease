import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { lots, LOT_STATUS_CONFIG, type Lot, type LotStatus } from "@/data/mockData";
import { useParams } from "react-router-dom";
import { X, MapPin, User, Calendar, DollarSign, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

function LotDetail({ lot, onClose }: { lot: Lot; onClose: () => void }) {
  return (
    <div className="absolute right-0 top-0 h-full w-[360px] bg-card border-l border-border shadow-lg overflow-y-auto scrollbar-thin z-20 animate-fade-in">
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <h3 className="font-display font-bold text-lg text-card-foreground">Lote {lot.number}</h3>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="p-4 space-y-5">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className={cn("inline-block h-3 w-3 rounded-full", LOT_STATUS_CONFIG[lot.status].twClass)} />
          <span className="text-sm font-medium text-card-foreground">{LOT_STATUS_CONFIG[lot.status].label}</span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: MapPin, label: "Manzana", value: lot.block },
            { icon: MapPin, label: "Etapa", value: lot.stage },
            { icon: Ruler, label: "Superficie", value: `${lot.area} m²` },
            { icon: Ruler, label: "Frente", value: `${lot.front} m` },
            { icon: Ruler, label: "Fondo", value: `${lot.depth} m` },
            { icon: MapPin, label: "Tipo", value: lot.type },
            { icon: DollarSign, label: "Precio", value: formatCurrency(lot.basePrice) },
            { icon: DollarSign, label: "$/m²", value: formatCurrency(lot.pricePerM2) },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</span>
              </div>
              <p className="text-sm font-semibold text-card-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Client info */}
        {lot.clientName && (
          <div className="border-t border-border pt-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Asignación</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground">{lot.clientName}</span>
              </div>
              {lot.advisorName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Asesor: {lot.advisorName}</span>
                </div>
              )}
              {lot.saleDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Venta: {lot.saleDate}</span>
                </div>
              )}
              {lot.pendingBalance !== undefined && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Saldo: {formatCurrency(lot.pendingBalance)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-border pt-4 space-y-2">
          {lot.status === "disponible" && (
            <button className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
              Apartar Lote
            </button>
          )}
          <button className="w-full rounded-lg border border-border text-card-foreground py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            Ver Historial
          </button>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.entries(LOT_STATUS_CONFIG) as [LotStatus, typeof LOT_STATUS_CONFIG[LotStatus]][]).map(([key, config]) => (
        <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("h-2.5 w-2.5 rounded-sm", config.twClass)} />
          {config.label}
        </div>
      ))}
    </div>
  );
}

export default function LotMap() {
  const { developmentId } = useParams();
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [filter, setFilter] = useState<LotStatus | "all">("all");
  const [search, setSearch] = useState("");

  const devLots = lots.filter((l) => l.developmentId === (developmentId || "dev-1"));
  const filtered = devLots.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (search && !l.number.includes(search) && !l.block.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Mapa de Lotes</h1>
            <p className="text-sm text-muted-foreground mt-1">Residencial Los Álamos — Haz clic en un lote para ver detalles</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar lote o manzana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 w-52"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          >
            <option value="all">Todos los estatus</option>
            {(Object.entries(LOT_STATUS_CONFIG) as [LotStatus, any][]).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <Legend />

        {/* Map area */}
        <div className="relative rounded-xl border border-border bg-card shadow-sm overflow-hidden" style={{ minHeight: 500 }}>
          <svg
            viewBox="0 0 100 100"
            className="w-full"
            style={{ aspectRatio: "8/6" }}
          >
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="12.5" height="16.667" patternUnits="userSpaceOnUse">
                <path d="M 12.5 0 L 0 0 0 16.667" fill="none" stroke="hsl(var(--border))" strokeWidth="0.15" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {filtered.map((lot) => {
              const isSelected = selectedLot?.id === lot.id;
              const points = lot.polygon;
              const statusConfig = LOT_STATUS_CONFIG[lot.status];
              // Parse color from CSS var
              return (
                <g key={lot.id} onClick={() => setSelectedLot(lot)} className="cursor-pointer">
                  <polygon
                    points={points}
                    fill={`hsl(var(${statusConfig.colorVar}) / ${isSelected ? 0.9 : 0.6})`}
                    stroke={isSelected ? "hsl(var(--foreground))" : `hsl(var(${statusConfig.colorVar}))`}
                    strokeWidth={isSelected ? 0.4 : 0.2}
                    className="transition-all duration-150 hover:opacity-90"
                  />
                  {/* Lot number label */}
                  {(() => {
                    const pts = points.split(" ").map((p) => p.split(",").map(Number));
                    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
                    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="2"
                        fontWeight="600"
                        fill="hsl(var(--foreground))"
                        className="pointer-events-none select-none"
                        style={{ fontFamily: "Space Grotesk" }}
                      >
                        {lot.number}
                      </text>
                    );
                  })()}
                </g>
              );
            })}
          </svg>

          {/* Detail panel */}
          {selectedLot && <LotDetail lot={selectedLot} onClose={() => setSelectedLot(null)} />}
        </div>
      </div>
    </AppLayout>
  );
}
