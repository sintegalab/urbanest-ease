export type LotStatus = 'disponible' | 'reservado' | 'apartado' | 'vendido' | 'financiado' | 'liquidado' | 'bloqueado' | 'vencido' | 'escriturado';

export const LOT_STATUS_CONFIG: Record<LotStatus, { label: string; colorVar: string; twClass: string }> = {
  disponible: { label: 'Disponible', colorVar: '--lot-available', twClass: 'bg-lot-available' },
  reservado: { label: 'Reservado', colorVar: '--lot-reserved', twClass: 'bg-lot-reserved' },
  apartado: { label: 'Apartado', colorVar: '--lot-separated', twClass: 'bg-lot-separated' },
  vendido: { label: 'Vendido', colorVar: '--lot-sold', twClass: 'bg-lot-sold' },
  financiado: { label: 'Financiado', colorVar: '--lot-financed', twClass: 'bg-lot-financed' },
  liquidado: { label: 'Liquidado', colorVar: '--lot-settled', twClass: 'bg-lot-settled' },
  bloqueado: { label: 'Bloqueado', colorVar: '--lot-blocked', twClass: 'bg-lot-blocked' },
  vencido: { label: 'En mora', colorVar: '--lot-overdue', twClass: 'bg-lot-overdue' },
  escriturado: { label: 'Escriturado', colorVar: '--lot-deeded', twClass: 'bg-lot-deeded' },
};

export type DevStatus = 'planeacion' | 'preventa' | 'venta_activa' | 'liquidado' | 'suspendido';

export interface Development {
  id: string;
  name: string;
  clave: string;
  location: string;
  description: string;
  status: DevStatus;
  totalArea: number;
  totalLots: number;
  soldLots: number;
  startDate: string;
  stages: string[];
}

export interface Lot {
  id: string;
  developmentId: string;
  number: string;
  block: string;
  stage: string;
  area: number;
  front: number;
  depth: number;
  type: string;
  basePrice: number;
  pricePerM2: number;
  status: LotStatus;
  clientName?: string;
  advisorName?: string;
  saleDate?: string;
  pendingBalance?: number;
  // SVG polygon coords (relative %)
  polygon: string;
}

export interface Client {
  id: string;
  name: string;
  type: 'fisica' | 'moral';
  rfc: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  lotsCount: number;
}

export interface Sale {
  id: string;
  lotId: string;
  lotNumber: string;
  developmentName: string;
  clientName: string;
  saleDate: string;
  totalPrice: number;
  downPayment: number;
  monthlyPayment: number;
  term: number;
  interestRate: number;
  paidAmount: number;
  pendingBalance: number;
  status: 'activa' | 'liquidada' | 'cancelada' | 'reestructurada';
  nextPaymentDate: string;
}

export interface Payment {
  id: string;
  saleId: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
  type: 'enganche' | 'mensualidad' | 'abono_capital' | 'extraordinario';
  status: 'aplicado' | 'cancelado';
}

export interface AmortizationRow {
  number: number;
  dueDate: string;
  openingBalance: number;
  principal: number;
  interest: number;
  surcharge: number;
  totalDue: number;
  closingBalance: number;
  status: 'pagado' | 'pendiente' | 'vencido' | 'parcial';
}

// --- MOCK DATA ---

export const developments: Development[] = [
  {
    id: 'dev-1',
    name: 'Residencial Los Álamos',
    clave: 'RLA-001',
    location: 'Querétaro, Qro.',
    description: 'Desarrollo residencial premium con áreas verdes y amenidades de primera.',
    status: 'venta_activa',
    totalArea: 45000,
    totalLots: 48,
    soldLots: 22,
    startDate: '2024-03-15',
    stages: ['Etapa 1', 'Etapa 2'],
  },
  {
    id: 'dev-2',
    name: 'Parque Industrial Norte',
    clave: 'PIN-002',
    location: 'San Luis Potosí, S.L.P.',
    description: 'Parque industrial con lotes comerciales e industriales.',
    status: 'preventa',
    totalArea: 120000,
    totalLots: 36,
    soldLots: 5,
    startDate: '2025-01-10',
    stages: ['Fase A'],
  },
  {
    id: 'dev-3',
    name: 'Villas del Lago',
    clave: 'VDL-003',
    location: 'León, Gto.',
    description: 'Fraccionamiento campestre con vista al lago artificial.',
    status: 'planeacion',
    totalArea: 30000,
    totalLots: 24,
    soldLots: 0,
    startDate: '2026-06-01',
    stages: ['Única'],
  },
];

// Generate lots for dev-1 in a grid layout
function generateLots(): Lot[] {
  const statuses: LotStatus[] = ['disponible', 'disponible', 'disponible', 'apartado', 'vendido', 'vendido', 'financiado', 'liquidado', 'reservado', 'vencido', 'escriturado', 'bloqueado'];
  const types = ['residencial', 'residencial', 'residencial', 'esquina', 'comercial'];
  const clients = ['Juan Pérez López', 'María García Hernández', 'Carlos Rodríguez Sánchez', 'Ana Martínez Ruiz', 'Roberto Díaz Torres'];
  const advisors = ['Lic. Fernando Reyes', 'Arq. Patricia Mora', 'Ing. Luis Vargas'];
  const lots: Lot[] = [];
  const cols = 8;
  const rows = 6;
  const w = 100 / cols;
  const h = 100 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= 48) break;
      const x = c * w;
      const y = r * h;
      const pad = 0.5;
      const polygon = `${x + pad},${y + pad} ${x + w - pad},${y + pad} ${x + w - pad},${y + h - pad} ${x + pad},${y + h - pad}`;
      const status = statuses[idx % statuses.length];
      const hasClient = !['disponible', 'bloqueado'].includes(status);
      lots.push({
        id: `lot-${idx + 1}`,
        developmentId: 'dev-1',
        number: `${idx + 1}`,
        block: `M${Math.floor(r / 2) + 1}`,
        stage: r < 3 ? 'Etapa 1' : 'Etapa 2',
        area: 150 + Math.floor(Math.random() * 100),
        front: 8 + Math.floor(Math.random() * 5),
        depth: 18 + Math.floor(Math.random() * 7),
        type: types[idx % types.length],
        basePrice: 450000 + Math.floor(Math.random() * 300000),
        pricePerM2: 2800 + Math.floor(Math.random() * 800),
        status,
        clientName: hasClient ? clients[idx % clients.length] : undefined,
        advisorName: hasClient ? advisors[idx % advisors.length] : undefined,
        saleDate: hasClient ? '2025-0' + (1 + (idx % 9)) + '-15' : undefined,
        pendingBalance: hasClient ? Math.floor(Math.random() * 300000) : undefined,
        polygon,
      });
    }
  }
  return lots;
}

export const lots: Lot[] = generateLots();

export const clients: Client[] = [
  { id: 'cli-1', name: 'Juan Pérez López', type: 'fisica', rfc: 'PELJ850312ABC', email: 'juan.perez@email.com', phone: '442-123-4567', address: 'Av. Universidad 234, Querétaro', createdAt: '2024-06-10', lotsCount: 2 },
  { id: 'cli-2', name: 'María García Hernández', type: 'fisica', rfc: 'GAHM900520DEF', email: 'maria.garcia@email.com', phone: '442-234-5678', address: 'Blvd. Bernardo Quintana 100, Querétaro', createdAt: '2024-07-22', lotsCount: 1 },
  { id: 'cli-3', name: 'Corporativo Inmuebles SA de CV', type: 'moral', rfc: 'CIN050101GHI', email: 'contacto@corpoinmuebles.com', phone: '55-9876-5432', address: 'Paseo de la Reforma 500, CDMX', createdAt: '2024-08-05', lotsCount: 3 },
  { id: 'cli-4', name: 'Carlos Rodríguez Sánchez', type: 'fisica', rfc: 'ROSC880115JKL', email: 'carlos.rod@email.com', phone: '477-345-6789', address: 'Calle Hidalgo 45, León', createdAt: '2025-01-12', lotsCount: 1 },
  { id: 'cli-5', name: 'Ana Martínez Ruiz', type: 'fisica', rfc: 'MARA920830MNO', email: 'ana.mtz@email.com', phone: '442-456-7890', address: 'Av. Constituyentes 789, Querétaro', createdAt: '2025-02-20', lotsCount: 1 },
];

export const sales: Sale[] = [
  { id: 'sale-1', lotId: 'lot-4', lotNumber: '4', developmentName: 'Residencial Los Álamos', clientName: 'Juan Pérez López', saleDate: '2025-01-15', totalPrice: 650000, downPayment: 130000, monthlyPayment: 14444, term: 36, interestRate: 12, paidAmount: 274000, pendingBalance: 376000, status: 'activa', nextPaymentDate: '2026-04-01' },
  { id: 'sale-2', lotId: 'lot-5', lotNumber: '5', developmentName: 'Residencial Los Álamos', clientName: 'María García Hernández', saleDate: '2025-02-10', totalPrice: 520000, downPayment: 104000, monthlyPayment: 11556, term: 36, interestRate: 12, paidAmount: 520000, pendingBalance: 0, status: 'liquidada', nextPaymentDate: '' },
  { id: 'sale-3', lotId: 'lot-6', lotNumber: '6', developmentName: 'Residencial Los Álamos', clientName: 'Carlos Rodríguez Sánchez', saleDate: '2025-03-20', totalPrice: 710000, downPayment: 142000, monthlyPayment: 15778, term: 36, interestRate: 12, paidAmount: 189556, pendingBalance: 520444, status: 'activa', nextPaymentDate: '2026-03-20' },
];

export const payments: Payment[] = [
  { id: 'pay-1', saleId: 'sale-1', date: '2025-01-15', amount: 130000, method: 'transferencia', reference: 'TRF-001234', type: 'enganche', status: 'aplicado' },
  { id: 'pay-2', saleId: 'sale-1', date: '2025-02-01', amount: 14444, method: 'transferencia', reference: 'TRF-001567', type: 'mensualidad', status: 'aplicado' },
  { id: 'pay-3', saleId: 'sale-1', date: '2025-03-01', amount: 14444, method: 'deposito', reference: 'DEP-002345', type: 'mensualidad', status: 'aplicado' },
  { id: 'pay-4', saleId: 'sale-2', date: '2025-02-10', amount: 520000, method: 'transferencia', reference: 'TRF-003456', type: 'enganche', status: 'aplicado' },
  { id: 'pay-5', saleId: 'sale-3', date: '2025-03-20', amount: 142000, method: 'cheque', reference: 'CHQ-001122', type: 'enganche', status: 'aplicado' },
  { id: 'pay-6', saleId: 'sale-3', date: '2025-04-20', amount: 15778, method: 'transferencia', reference: 'TRF-004567', type: 'mensualidad', status: 'aplicado' },
];

export function generateAmortization(sale: Sale): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  const monthlyRate = sale.interestRate / 100 / 12;
  let balance = sale.totalPrice - sale.downPayment;
  const startDate = new Date(sale.saleDate);
  const paidMonths = Math.floor((sale.paidAmount - sale.downPayment) / sale.monthlyPayment);

  for (let i = 1; i <= sale.term; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    const interest = Math.round(balance * monthlyRate);
    const principal = sale.monthlyPayment - interest;
    const closingBalance = Math.max(0, balance - principal);
    
    let status: AmortizationRow['status'] = 'pendiente';
    if (i <= paidMonths) status = 'pagado';
    else if (dueDate < new Date()) status = 'vencido';

    rows.push({
      number: i,
      dueDate: dueDate.toISOString().split('T')[0],
      openingBalance: balance,
      principal: Math.round(principal),
      interest,
      surcharge: status === 'vencido' ? Math.round(interest * 0.5) : 0,
      totalDue: sale.monthlyPayment + (status === 'vencido' ? Math.round(interest * 0.5) : 0),
      closingBalance: Math.round(closingBalance),
      status,
    });
    balance = closingBalance;
  }
  return rows;
}

// Audit logs
export interface AuditLog {
  id: string;
  date: string;
  time: string;
  user: string;
  role: string;
  action: string;
  module: string;
  entity: string;
  detail: string;
  ip: string;
}

export const auditLogs: AuditLog[] = [
  { id: 'aud-1', date: '2026-03-09', time: '10:32:15', user: 'Fernando Reyes', role: 'ventas', action: 'Apartado de lote', module: 'Lotes', entity: 'Lote 12 – M2', detail: 'Cambió estatus de "disponible" a "apartado". Cliente: Ana Martínez Ruiz.', ip: '192.168.1.45' },
  { id: 'aud-2', date: '2026-03-09', time: '09:15:00', user: 'Admin Sistema', role: 'superadmin', action: 'Registro de pago', module: 'Pagos', entity: 'Venta SALE-001', detail: 'Pago mensualidad #10 por $14,444. Método: transferencia. Ref: TRF-009988.', ip: '192.168.1.10' },
  { id: 'aud-3', date: '2026-03-08', time: '16:45:30', user: 'Patricia Mora', role: 'ventas', action: 'Venta registrada', module: 'Ventas', entity: 'Lote 5 – M1', detail: 'Venta a María García Hernández. Precio: $520,000. Contado.', ip: '192.168.1.52' },
  { id: 'aud-4', date: '2026-03-08', time: '14:20:10', user: 'Admin Sistema', role: 'superadmin', action: 'Cancelación de venta', module: 'Ventas', entity: 'Venta SALE-007', detail: 'Cancelación autorizada. Motivo: incumplimiento de pago. Lote liberado.', ip: '192.168.1.10' },
  { id: 'aud-5', date: '2026-03-07', time: '11:00:05', user: 'Luis Vargas', role: 'cobranza', action: 'Aplicación de recargo', module: 'Cobranza', entity: 'Venta SALE-003', detail: 'Recargo moratorio de $2,367 aplicado por 15 días de atraso.', ip: '192.168.1.60' },
  { id: 'aud-6', date: '2026-03-07', time: '09:30:00', user: 'Admin Sistema', role: 'superadmin', action: 'Descuento extraordinario', module: 'Pagos', entity: 'Venta SALE-001', detail: 'Condonación de recargos por $1,200. Autorizado por dirección.', ip: '192.168.1.10' },
  { id: 'aud-7', date: '2026-03-06', time: '17:10:22', user: 'Fernando Reyes', role: 'ventas', action: 'Edición de cliente', module: 'Clientes', entity: 'CLI-004', detail: 'Actualización de teléfono y correo electrónico.', ip: '192.168.1.45' },
  { id: 'aud-8', date: '2026-03-06', time: '12:55:40', user: 'Patricia Mora', role: 'ventas', action: 'Reestructura de financiamiento', module: 'Ventas', entity: 'Venta SALE-003', detail: 'Plazo extendido de 36 a 48 meses. Tasa mantenida al 12%. Autorizado.', ip: '192.168.1.52' },
  { id: 'aud-9', date: '2026-03-05', time: '08:45:15', user: 'Admin Sistema', role: 'superadmin', action: 'Cambio de precio de lote', module: 'Lotes', entity: 'Lote 22 – M3', detail: 'Precio base actualizado de $480,000 a $510,000.', ip: '192.168.1.10' },
  { id: 'aud-10', date: '2026-03-05', time: '08:00:00', user: 'Sistema', role: 'sistema', action: 'Generación automática de moratorios', module: 'Cobranza', entity: '3 ventas', detail: 'Recargos generados para ventas SALE-001, SALE-003, SALE-006 por vencimiento.', ip: '0.0.0.0' },
];

// Dashboard stats
export const dashboardStats = {
  totalLots: 48,
  availableLots: 18,
  soldLots: 22,
  reservedLots: 8,
  monthlyIncome: 1245000,
  expectedCollection: 1890000,
  overdueClients: 3,
  overdueAmount: 156780,
};
