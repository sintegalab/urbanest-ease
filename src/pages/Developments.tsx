import AppLayout from "@/components/AppLayout";
import { developments } from "@/data/mockData";
import { Building2, MapPin, Calendar, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, { label: string; className: string }> = {
  planeacion: { label: "Planeación", className: "bg-lot-reserved/20 text-lot-reserved" },
  preventa: { label: "Preventa", className: "bg-lot-separated/20 text-lot-separated" },
  venta_activa: { label: "Venta activa", className: "bg-lot-available/20 text-lot-available" },
  liquidado: { label: "Liquidado", className: "bg-lot-settled/20 text-lot-settled" },
  suspendido: { label: "Suspendido", className: "bg-lot-blocked/20 text-lot-blocked" },
};

export default function Developments() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Desarrollos</h1>
            <p className="text-sm text-muted-foreground mt-1">Catálogo de fraccionamientos y proyectos</p>
          </div>
          <button className="rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
            + Nuevo Desarrollo
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {developments.map((dev) => {
            const s = statusLabels[dev.status];
            const pct = Math.round((dev.soldLots / dev.totalLots) * 100);
            return (
              <div
                key={dev.id}
                onClick={() => navigate(`/mapa/${dev.id}`)}
                className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group animate-fade-in"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full", s.className)}>
                    {s.label}
                  </span>
                </div>
                <h3 className="font-display font-bold text-card-foreground text-base mb-1">{dev.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{dev.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {dev.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Layers className="h-3 w-3" /> {dev.totalLots} lotes
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {dev.startDate}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {dev.stages.join(", ")}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Avance de venta</span>
                    <span className="font-semibold text-card-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
