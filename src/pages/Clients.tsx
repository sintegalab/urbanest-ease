import AppLayout from "@/components/AppLayout";
import { clients } from "@/data/mockData";
import { Search, User, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.rfc.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const detail = clients.find((c) => c.id === selected);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1">{clients.length} clientes registrados</p>
          </div>
          <button className="rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
            + Nuevo Cliente
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, RFC, correo o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <div className="flex gap-4">
          {/* Table */}
          <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">RFC</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Correo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Teléfono</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Lotes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={cn(
                      "border-b border-border last:border-0 cursor-pointer transition-colors",
                      selected === c.id ? "bg-accent" : "hover:bg-muted/30"
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-card-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.rfc}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3 text-center font-semibold text-card-foreground">{c.lotsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail */}
          {detail && (
            <div className="w-[300px] rounded-xl border border-border bg-card shadow-sm p-5 space-y-4 animate-fade-in shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display font-bold text-card-foreground">{detail.name}</p>
                  <p className="text-xs text-muted-foreground">{detail.type === 'fisica' ? 'Persona Física' : 'Persona Moral'}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> {detail.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" /> {detail.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {detail.address}
                </div>
              </div>
              <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                RFC: <span className="font-mono">{detail.rfc}</span><br />
                Registrado: {detail.createdAt}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
