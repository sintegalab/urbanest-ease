import AppLayout from "@/components/AppLayout";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { lots, developments, clients } from "@/data/mockData";
import { ArrowLeft, Plus, Trash2, CheckCircle2, MapPin, User, FileText, CreditCard, AlertCircle, Search, UserPlus, Percent, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type SaleType = "contado" | "credito" | "donacion" | "cesion";
type PaymentConcept = "apartado" | "anticipo" | "enganche" | "abono" | "mensualidad" | "liquidacion" | "recargo" | "descuento";
type DiscountType = "contado" | "fijo" | "porcentual" | "promocion" | "manual";

const DISCOUNT_TYPES: { value: DiscountType; label: string; description: string }[] = [
  { value: "contado", label: "Descuento por contado", description: "Aplicado por pago de contado" },
  { value: "fijo", label: "Descuento fijo", description: "Monto fijo de descuento" },
  { value: "porcentual", label: "Descuento porcentual", description: "Porcentaje sobre el precio" },
  { value: "promocion", label: "Promoción temporal", description: "Campaña o evento vigente" },
  { value: "manual", label: "Autorizado manualmente", description: "Requiere autorización de dirección" },
];

interface PaymentPlanRow {
  id: string;
  concept: PaymentConcept;
  amount: number;
  dueDate: string;
  note: string;
}

const SALE_TYPES: { value: SaleType; label: string; description: string; icon: string }[] = [
  { value: "contado", label: "Contado", description: "Pago total inmediato o en exhibiciones cortas", icon: "💵" },
  { value: "credito", label: "Crédito", description: "Enganche + mensualidades o pagos programados", icon: "📅" },
  { value: "donacion", label: "Donación", description: "Asignación sin costo (socios, promociones)", icon: "🎁" },
  { value: "cesion", label: "Cesión", description: "Transferencia de derechos entre partes", icon: "🔄" },
];

const CONCEPT_OPTIONS: Record<SaleType, { value: PaymentConcept; label: string }[]> = {
  contado: [
    { value: "apartado", label: "Apartado" },
    { value: "anticipo", label: "Anticipo" },
    { value: "liquidacion", label: "Liquidación" },
    { value: "abono", label: "Abono" },
    { value: "descuento", label: "Descuento" },
  ],
  credito: [
    { value: "apartado", label: "Apartado" },
    { value: "enganche", label: "Enganche" },
    { value: "mensualidad", label: "Mensualidad" },
    { value: "abono", label: "Abono extra" },
    { value: "recargo", label: "Recargo" },
    { value: "descuento", label: "Descuento" },
  ],
  donacion: [],
  cesion: [
    { value: "anticipo", label: "Anticipo cesión" },
    { value: "liquidacion", label: "Liquidación cesión" },
  ],
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

const STEPS = ["Lote", "Cliente", "Tipo de Venta", "Plan de Pagos", "Resumen"];

export default function NewSale() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1: Lot
  const [selectedDevId, setSelectedDevId] = useState("");
  const [selectedLotId, setSelectedLotId] = useState("");

  // Step 2: Client
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  // Step 3: Sale type
  const [saleType, setSaleType] = useState<SaleType | "">("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>("fijo");
  const [discountValue, setDiscountValue] = useState("");
  const [discountNote, setDiscountNote] = useState("");

  // Step 4: Payment plan (credit)
  const [interestRate, setInterestRate] = useState("12");
  const [term, setTerm] = useState("36");
  const [downPaymentPct, setDownPaymentPct] = useState("10");
  const [paymentRows, setPaymentRows] = useState<PaymentPlanRow[]>([]);

  const availableLots = useMemo(
    () => lots.filter((l) => l.developmentId === selectedDevId && l.status === "disponible"),
    [selectedDevId]
  );
  const selectedLot = lots.find((l) => l.id === selectedLotId);
  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const basePrice = agreedPrice ? Number(agreedPrice) : selectedLot?.basePrice || 0;

  // Discount calculation
  const discountAmount = discountEnabled
    ? discountType === "porcentual" || discountType === "contado"
      ? Math.round(basePrice * (Number(discountValue) / 100))
      : Number(discountValue) || 0
    : 0;
  const price = Math.max(0, basePrice - discountAmount);

  // Client filtering
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.rfc.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [clientSearch]);

  // Credit calculations
  const downPaymentAmount = Math.round(price * (Number(downPaymentPct) / 100));
  const financedAmount = price - downPaymentAmount;
  const monthlyRate = Number(interestRate) / 100 / 12;
  const termNum = Number(term);
  const monthlyPayment = monthlyRate > 0 && termNum > 0
    ? Math.round((financedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termNum)))
    : termNum > 0 ? Math.round(financedAmount / termNum) : 0;
  const totalWithInterest = monthlyPayment * termNum + downPaymentAmount;

  function addPaymentRow() {
    const concepts = CONCEPT_OPTIONS[saleType as SaleType] || [];
    setPaymentRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        concept: concepts[0]?.value || "abono",
        amount: 0,
        dueDate: new Date().toISOString().split("T")[0],
        note: "",
      },
    ]);
  }

  function removePaymentRow(id: string) {
    setPaymentRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updatePaymentRow(id: string, field: keyof PaymentPlanRow, value: string | number) {
    setPaymentRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function generateCreditPlan() {
    const rows: PaymentPlanRow[] = [];
    const today = new Date();

    // Enganche
    rows.push({
      id: crypto.randomUUID(),
      concept: "enganche",
      amount: downPaymentAmount,
      dueDate: today.toISOString().split("T")[0],
      note: `${downPaymentPct}% del precio`,
    });

    // Mensualidades
    for (let i = 1; i <= termNum; i++) {
      const d = new Date(today);
      d.setMonth(d.getMonth() + i);
      rows.push({
        id: crypto.randomUUID(),
        concept: "mensualidad",
        amount: monthlyPayment,
        dueDate: d.toISOString().split("T")[0],
        note: `Pago ${i} de ${termNum}`,
      });
    }
    setPaymentRows(rows);
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return !!selectedLotId;
      case 1: return !!selectedClientId;
      case 2: return !!saleType && price > 0;
      case 3: return saleType === "donacion" || paymentRows.length > 0;
      default: return true;
    }
  }

  function handleSubmit() {
    toast.success("Venta registrada exitosamente", {
      description: `Lote ${selectedLot?.number} → ${selectedClient?.name} · ${formatCurrency(price)}`,
    });
    navigate("/ventas");
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/ventas")} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Nueva Venta</h1>
            <p className="text-sm text-muted-foreground">Registrar operación de venta de lote</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all w-full",
                  i === step && "bg-primary text-primary-foreground shadow-sm",
                  i < step && "bg-accent text-accent-foreground cursor-pointer hover:opacity-80",
                  i > step && "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <span className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                    i === step ? "bg-primary-foreground/20" : "bg-muted-foreground/20"
                  )}>{i + 1}</span>
                )}
                <span className="hidden md:inline truncate">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-border shrink-0" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 min-h-[400px]">
          {/* STEP 0: Lot Selection */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                <h2 className="text-lg font-display font-bold text-card-foreground">Seleccionar Lote</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Desarrollo</Label>
                  <Select value={selectedDevId} onValueChange={(v) => { setSelectedDevId(v); setSelectedLotId(""); }}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecciona un desarrollo" /></SelectTrigger>
                    <SelectContent>
                      {developments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name} — {d.location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDevId && (
                  <div>
                    <Label>Lote disponible ({availableLots.length})</Label>
                    {availableLots.length === 0 ? (
                      <div className="mt-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        No hay lotes disponibles en este desarrollo.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {availableLots.map((lot) => (
                          <button
                            key={lot.id}
                            onClick={() => setSelectedLotId(lot.id)}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all",
                              selectedLotId === lot.id
                                ? "border-primary bg-accent shadow-sm ring-1 ring-primary"
                                : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                            )}
                          >
                            <p className="font-bold text-sm text-card-foreground">Lote {lot.number}</p>
                            <p className="text-xs text-muted-foreground">{lot.block} · {lot.area} m² · {lot.type}</p>
                            <p className="text-xs font-semibold text-primary mt-1">{formatCurrency(lot.basePrice)}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedLot && (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Lote seleccionado</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Lote", value: `#${selectedLot.number}` },
                        { label: "Manzana", value: selectedLot.block },
                        { label: "Superficie", value: `${selectedLot.area} m²` },
                        { label: "Precio base", value: formatCurrency(selectedLot.basePrice) },
                        { label: "Frente", value: `${selectedLot.front} m` },
                        { label: "Fondo", value: `${selectedLot.depth} m` },
                        { label: "Tipo", value: selectedLot.type },
                        { label: "Precio/m²", value: formatCurrency(selectedLot.pricePerM2) },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-semibold text-card-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: Client */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  <h2 className="text-lg font-display font-bold text-card-foreground">Seleccionar Cliente</h2>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Formulario de nuevo cliente próximamente")}>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Nuevo Cliente
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, RFC, correo o teléfono..."
                  className="pl-9"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredClients.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No se encontraron clientes con "{clientSearch}"
                  </div>
                ) : (
                  filteredClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClientId(c.id)}
                      className={cn(
                        "w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between",
                        selectedClientId === c.id
                          ? "border-primary bg-accent shadow-sm ring-1 ring-primary"
                          : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                      )}
                    >
                      <div>
                        <p className="font-bold text-sm text-card-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.rfc} · {c.email} · {c.phone}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ml-2",
                        c.type === "fisica" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
                      )}>
                        {c.type === "fisica" ? "Persona Física" : "Persona Moral"}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Sale Type */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                <h2 className="text-lg font-display font-bold text-card-foreground">Tipo de Venta</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SALE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setSaleType(t.value);
                      setPaymentRows([]);
                    }}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      saleType === t.value
                        ? "border-primary bg-accent shadow-sm ring-1 ring-primary"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <p className="font-bold text-sm text-card-foreground mt-2">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label>Precio acordado</Label>
                  <Input
                    type="number"
                    className="mt-1.5"
                    placeholder={selectedLot ? formatCurrency(selectedLot.basePrice) : "0"}
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Dejar vacío para usar precio base del lote</p>
                </div>
                <div>
                  <Label>Notas de la operación</Label>
                  <Textarea className="mt-1.5 h-[72px]" placeholder="Observaciones..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>

              {/* Discount Section */}
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setDiscountEnabled(!discountEnabled); if (discountEnabled) { setDiscountValue(""); setDiscountNote(""); } }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 transition-colors",
                    discountEnabled ? "bg-accent" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-card-foreground">Aplicar descuento</span>
                  </div>
                  <div className={cn(
                    "h-5 w-9 rounded-full transition-colors relative",
                    discountEnabled ? "bg-primary" : "bg-muted-foreground/30"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                      discountEnabled ? "translate-x-4" : "translate-x-0.5"
                    )} />
                  </div>
                </button>

                {discountEnabled && (
                  <div className="p-4 border-t border-border space-y-4">
                    <div>
                      <Label className="text-xs">Tipo de descuento</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {DISCOUNT_TYPES.map((d) => (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => { setDiscountType(d.value); setDiscountValue(""); }}
                            className={cn(
                              "p-2.5 rounded-lg border text-left transition-all",
                              discountType === d.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:bg-muted/50"
                            )}
                          >
                            <p className="text-xs font-semibold text-card-foreground">{d.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{d.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">
                          {discountType === "porcentual" || discountType === "contado" ? "Porcentaje (%)" : "Monto ($)"}
                        </Label>
                        <div className="relative mt-1">
                          <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type="number"
                            className="pl-8"
                            placeholder={discountType === "porcentual" || discountType === "contado" ? "Ej: 5" : "Ej: 25000"}
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            min={0}
                            max={discountType === "porcentual" || discountType === "contado" ? 100 : undefined}
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Justificación / nota</Label>
                        <Input
                          className="mt-1"
                          placeholder="Motivo del descuento..."
                          value={discountNote}
                          onChange={(e) => setDiscountNote(e.target.value)}
                        />
                      </div>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <span className="text-xs font-medium text-muted-foreground">Descuento aplicado</span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">-{formatCurrency(discountAmount)}</p>
                          <p className="text-[10px] text-muted-foreground">Precio final: {formatCurrency(price)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Payment Plan */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                  <h2 className="text-lg font-display font-bold text-card-foreground">Plan de Pagos</h2>
                </div>
                <p className="text-sm font-semibold text-card-foreground">{formatCurrency(price)}</p>
              </div>

              {saleType === "donacion" && (
                <div className="p-6 rounded-lg bg-muted/30 border border-border text-center">
                  <span className="text-3xl">🎁</span>
                  <p className="text-sm text-muted-foreground mt-2">Las donaciones no requieren plan de pagos.</p>
                  <p className="text-xs text-muted-foreground">El lote se asignará directamente al beneficiario.</p>
                </div>
              )}

              {saleType === "credito" && (
                <>
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-muted/20 border border-border">
                    <div>
                      <Label className="text-xs">Enganche (%)</Label>
                      <Input type="number" className="mt-1" value={downPaymentPct} onChange={(e) => setDownPaymentPct(e.target.value)} min={0} max={100} />
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(downPaymentAmount)}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Plazo (meses)</Label>
                      <Select value={term} onValueChange={setTerm}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                            <SelectItem key={m} value={String(m)}>{m} meses</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Tasa anual (%)</Label>
                      <Input type="number" className="mt-1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} min={0} step={0.5} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-accent/50 border border-border">
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">Mensualidad</p>
                      <p className="text-lg font-bold text-card-foreground">{formatCurrency(monthlyPayment)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/50 border border-border">
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">Monto financiado</p>
                      <p className="text-lg font-bold text-card-foreground">{formatCurrency(financedAmount)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/50 border border-border">
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">Total con intereses</p>
                      <p className="text-lg font-bold text-card-foreground">{formatCurrency(totalWithInterest)}</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={generateCreditPlan}>
                    Generar tabla de amortización
                  </Button>
                </>
              )}

              {(saleType === "contado" || saleType === "cesion") && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Define los pagos que componen esta operación.</p>
                  <Button variant="outline" size="sm" onClick={addPaymentRow}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Agregar pago
                  </Button>
                </div>
              )}

              {paymentRows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        {["#", "Concepto", "Monto", "Fecha", "Nota", ""].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paymentRows.map((row, i) => (
                        <tr key={row.id} className="border-b border-border">
                          <td className="px-3 py-2 font-semibold text-card-foreground">{i + 1}</td>
                          <td className="px-3 py-2">
                            <Select
                              value={row.concept}
                              onValueChange={(v) => updatePaymentRow(row.id, "concept", v)}
                            >
                              <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {(CONCEPT_OPTIONS[saleType as SaleType] || []).map((c) => (
                                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              className="h-8 text-xs w-28"
                              value={row.amount || ""}
                              onChange={(e) => updatePaymentRow(row.id, "amount", Number(e.target.value))}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="date"
                              className="h-8 text-xs w-36"
                              value={row.dueDate}
                              onChange={(e) => updatePaymentRow(row.id, "dueDate", e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              className="h-8 text-xs w-32"
                              value={row.note}
                              onChange={(e) => updatePaymentRow(row.id, "note", e.target.value)}
                              placeholder="Nota..."
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => removePaymentRow(row.id)} className="text-destructive hover:text-destructive/80">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/20">
                        <td colSpan={2} className="px-3 py-2 font-bold text-card-foreground text-xs">Total programado</td>
                        <td className="px-3 py-2 font-bold text-card-foreground text-xs">
                          {formatCurrency(paymentRows.reduce((sum, r) => sum + r.amount, 0))}
                        </td>
                        <td colSpan={3} className="px-3 py-2">
                          {Math.abs(paymentRows.reduce((sum, r) => sum + r.amount, 0) - price) > 1 && (
                            <span className="text-destructive text-[10px] flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Diferencia de {formatCurrency(Math.abs(paymentRows.reduce((sum, r) => sum + r.amount, 0) - price))} vs precio
                            </span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Summary */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <h2 className="text-lg font-display font-bold text-card-foreground">Resumen de la Operación</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Lote</p>
                  <p className="text-sm font-bold text-card-foreground">Lote {selectedLot?.number} — {selectedLot?.block}</p>
                  <p className="text-xs text-muted-foreground">{selectedLot?.area} m² · {selectedLot?.type} · {formatCurrency(selectedLot?.basePrice || 0)}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Cliente</p>
                  <p className="text-sm font-bold text-card-foreground">{selectedClient?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedClient?.rfc} · {selectedClient?.email}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Operación</p>
                  <p className="text-sm font-bold text-card-foreground capitalize">{saleType}</p>
                  <p className="text-xs text-muted-foreground">Precio: {formatCurrency(price)}</p>
                  {notes && <p className="text-xs text-muted-foreground italic">"{notes}"</p>}
                </div>

                <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Plan de pagos</p>
                  <p className="text-sm font-bold text-card-foreground">
                    {saleType === "donacion" ? "Sin costo" : `${paymentRows.length} pagos programados`}
                  </p>
                  {saleType !== "donacion" && (
                    <p className="text-xs text-muted-foreground">
                      Total: {formatCurrency(paymentRows.reduce((s, r) => s + r.amount, 0))}
                    </p>
                  )}
                  {saleType === "credito" && (
                    <p className="text-xs text-muted-foreground">Tasa: {interestRate}% · Plazo: {term} meses</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate("/ventas")}>
            {step === 0 ? "Cancelar" : "← Anterior"}
          </Button>
          <div className="flex items-center gap-2">
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
                Siguiente →
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-lot-available hover:bg-lot-available/90 text-primary-foreground">
                Confirmar Venta ✓
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
