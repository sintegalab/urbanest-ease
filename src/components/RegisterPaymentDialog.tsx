import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sales, type Payment } from "@/data/mockData";
import { Search, DollarSign } from "lucide-react";
import { toast } from "sonner";

const methodOptions = [
  { value: "transferencia", label: "Transferencia" },
  { value: "deposito", label: "Depósito" },
  { value: "cheque", label: "Cheque" },
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
];

const typeOptions = [
  { value: "enganche", label: "Enganche" },
  { value: "mensualidad", label: "Mensualidad" },
  { value: "abono_capital", label: "Abono a capital" },
  { value: "extraordinario", label: "Extraordinario" },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentRegistered: (payment: Payment) => void;
}

export default function RegisterPaymentDialog({ open, onOpenChange, onPaymentRegistered }: Props) {
  const [saleSearch, setSaleSearch] = useState("");
  const [selectedSaleId, setSelectedSaleId] = useState("");
  const [type, setType] = useState<Payment["type"]>("mensualidad");
  const [method, setMethod] = useState("transferencia");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const activeSales = useMemo(
    () => sales.filter((s) => s.status === "activa"),
    []
  );

  const filtered = useMemo(() => {
    if (!saleSearch.trim()) return activeSales;
    const q = saleSearch.toLowerCase();
    return activeSales.filter(
      (s) =>
        s.clientName.toLowerCase().includes(q) ||
        s.lotNumber.includes(q) ||
        s.developmentName.toLowerCase().includes(q)
    );
  }, [saleSearch, activeSales]);

  const selectedSale = activeSales.find((s) => s.id === selectedSaleId);

  function reset() {
    setSaleSearch("");
    setSelectedSaleId("");
    setType("mensualidad");
    setMethod("transferencia");
    setAmount("");
    setReference("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  }

  function handleSubmit() {
    if (!selectedSaleId) {
      toast.error("Selecciona una venta");
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    if (!reference.trim()) {
      toast.error("Ingresa una referencia");
      return;
    }

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      saleId: selectedSaleId,
      date,
      amount: numAmount,
      method,
      reference: reference.trim(),
      type,
      status: "aplicado",
    };

    onPaymentRegistered(payment);
    toast.success("Pago registrado exitosamente");
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">Registrar Pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Sale Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Venta</Label>
            {!selectedSaleId ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente, lote o desarrollo…"
                    value={saleSearch}
                    onChange={(e) => setSaleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3 text-center">Sin resultados</p>
                  ) : (
                    filtered.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSelectedSaleId(s.id); setSaleSearch(""); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-muted/40 transition-colors"
                      >
                        <span className="text-sm font-medium text-card-foreground">{s.clientName}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          Lote {s.lotNumber} · {s.developmentName}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          Saldo: {formatCurrency(s.pendingBalance)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{selectedSale?.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    Lote {selectedSale?.lotNumber} · Saldo: {formatCurrency(selectedSale?.pendingBalance ?? 0)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSaleId("")}>
                  Cambiar
                </Button>
              </div>
            )}
          </div>

          {/* Type & Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo de pago</Label>
              <Select value={type} onValueChange={(v) => setType(v as Payment["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {typeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Método</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {methodOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Reference */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Referencia</Label>
            <Input placeholder="Ej: TRF-001234" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notas (opcional)</Label>
            <Textarea rows={2} placeholder="Observaciones adicionales…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Summary */}
          {selectedSale && amount && parseFloat(amount) > 0 && (
            <div className="rounded-lg border border-border bg-muted/10 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumen</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo actual</span>
                <span className="text-card-foreground">{formatCurrency(selectedSale.pendingBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pago a aplicar</span>
                <span className="font-semibold text-card-foreground">- {formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="border-t border-border pt-1 flex justify-between text-sm font-semibold">
                <span className="text-muted-foreground">Nuevo saldo</span>
                <span className="text-card-foreground">
                  {formatCurrency(Math.max(0, selectedSale.pendingBalance - parseFloat(amount)))}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Registrar Pago</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
