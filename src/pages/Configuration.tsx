import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Building2, DollarSign, Users, Bell, Shield, Database } from "lucide-react";

type Section = "general" | "financiero" | "roles" | "notificaciones" | "seguridad" | "sistema";

const sections: { key: Section; label: string; icon: React.ElementType; description: string }[] = [
  { key: "general", label: "General", icon: Building2, description: "Datos de la empresa y configuración base" },
  { key: "financiero", label: "Financiero", icon: DollarSign, description: "Tasas, moratorios y reglas de cálculo" },
  { key: "roles", label: "Roles y Permisos", icon: Users, description: "Gestión de usuarios y accesos" },
  { key: "notificaciones", label: "Notificaciones", icon: Bell, description: "Alertas y recordatorios automáticos" },
  { key: "seguridad", label: "Seguridad", icon: Shield, description: "Contraseñas, 2FA y sesiones" },
  { key: "sistema", label: "Sistema", icon: Database, description: "Respaldos, logs y mantenimiento" },
];

export default function Configuration() {
  const [active, setActive] = useState<Section>("general");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground mt-1">Parámetros y ajustes del sistema</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Section nav */}
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-3 py-3 text-sm font-medium transition-colors text-left",
                  active === s.key
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <s.icon className="h-4 w-4 shrink-0" />
                <div>
                  <p>{s.label}</p>
                  <p className="text-xs font-normal opacity-70">{s.description}</p>
                </div>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {active === "general" && <GeneralSettings />}
            {active === "financiero" && <FinancialSettings />}
            {active === "roles" && <RolesSettings />}
            {active === "notificaciones" && <NotificationSettings />}
            {active === "seguridad" && <SecuritySettings />}
            {active === "sistema" && <SystemSettings />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function InputField({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <FieldGroup label={label}>
      <input
        type={type}
        defaultValue={value}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </FieldGroup>
  );
}

function ToggleField({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-card-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span className={cn("pointer-events-none inline-block h-5 w-5 rounded-full bg-card shadow-lg transition-transform", checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}

function SaveButton() {
  return (
    <div className="pt-4 border-t border-border">
      <button className="rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
        Guardar Cambios
      </button>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-semibold text-card-foreground">Configuración General</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Nombre de la empresa" value="LotTracker Inmobiliaria" />
        <InputField label="RFC" value="LTI200101AAA" />
        <InputField label="Teléfono" value="+52 442 123 4567" />
        <InputField label="Correo de contacto" value="admin@lottracker.mx" type="email" />
        <div className="sm:col-span-2">
          <InputField label="Dirección fiscal" value="Av. Constituyentes 1234, Col. Centro, Querétaro, Qro. CP 76000" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Moneda predeterminada">
          <select defaultValue="MXN" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="MXN">MXN – Peso Mexicano</option>
            <option value="USD">USD – Dólar Americano</option>
          </select>
        </FieldGroup>
        <FieldGroup label="Zona horaria">
          <select defaultValue="America/Mexico_City" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
            <option value="America/Tijuana">Tijuana (UTC-8)</option>
            <option value="America/Cancun">Cancún (UTC-5)</option>
          </select>
        </FieldGroup>
      </div>
      <SaveButton />
    </div>
  );
}

function FinancialSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-semibold text-card-foreground">Configuración Financiera</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Tasa de interés anual (%)" value="12" type="number" />
        <InputField label="Tasa moratoria anual (%)" value="18" type="number" />
        <InputField label="Días de gracia" value="5" type="number" />
        <InputField label="Duración máxima de apartado (días)" value="15" type="number" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Tipo de interés">
          <select defaultValue="saldo_insoluto" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="saldo_insoluto">Sobre saldo insoluto</option>
            <option value="simple">Interés simple</option>
          </select>
        </FieldGroup>
        <FieldGroup label="Orden de aplicación de pagos">
          <select defaultValue="recargos_interes_capital" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="recargos_interes_capital">Recargos → Interés → Capital</option>
            <option value="capital_directo">Capital directo</option>
          </select>
        </FieldGroup>
        <InputField label="% Enganche mínimo" value="20" type="number" />
        <InputField label="Plazo máximo (meses)" value="60" type="number" />
      </div>
      <ToggleField label="IVA sobre intereses" description="Cobrar IVA (16%) sobre los intereses generados" defaultChecked />
      <ToggleField label="Redondeo a enteros" description="Redondear pagos al peso más cercano" defaultChecked />
      <SaveButton />
    </div>
  );
}

function RolesSettings() {
  const roles = [
    { name: "Super Admin", users: 1, perms: "Acceso total al sistema" },
    { name: "Dirección", users: 2, perms: "Reportes, autorización de descuentos, cancelaciones" },
    { name: "Ventas", users: 4, perms: "Prospectos, apartados, ventas, clientes" },
    { name: "Cobranza", users: 2, perms: "Pagos, estados de cuenta, moratorios" },
    { name: "Caja", users: 1, perms: "Registro de pagos, recibos" },
    { name: "Jurídico", users: 1, perms: "Contratos, documentos, escrituración" },
    { name: "Solo consulta", users: 3, perms: "Visualización sin edición" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-card-foreground">Roles y Permisos</h2>
        <button className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
          + Nuevo Rol
        </button>
      </div>
      <div className="space-y-3">
        {roles.map((r) => (
          <div key={r.name} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
            <div>
              <p className="text-sm font-medium text-card-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.perms}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{r.users} usuarios</span>
              <button className="text-xs text-primary hover:underline">Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-semibold text-card-foreground">Notificaciones</h2>
      <div className="space-y-0">
        <ToggleField label="Apartado próximo a vencer" description="Notificar 2 días antes del vencimiento del apartado" defaultChecked />
        <ToggleField label="Pago próximo a vencer" description="Recordatorio 3 días antes de la fecha de pago" defaultChecked />
        <ToggleField label="Pago vencido" description="Alerta inmediata al vencer un pago" defaultChecked />
        <ToggleField label="Venta registrada" description="Notificar a dirección cuando se registra una venta" defaultChecked />
        <ToggleField label="Cancelación de venta" description="Alerta a todos los administradores" defaultChecked />
        <ToggleField label="Documento faltante" description="Recordatorio semanal de expedientes incompletos" />
        <ToggleField label="Liquidación completada" description="Notificar cuando un cliente liquida su adeudo" defaultChecked />
      </div>
      <h3 className="text-sm font-semibold text-card-foreground pt-2">Canales</h3>
      <div className="space-y-0">
        <ToggleField label="Correo electrónico" description="Enviar notificaciones por email" defaultChecked />
        <ToggleField label="Notificaciones internas" description="Mostrar alertas dentro del sistema" defaultChecked />
        <ToggleField label="WhatsApp" description="Enviar recordatorios por WhatsApp (requiere configuración)" />
      </div>
      <SaveButton />
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-semibold text-card-foreground">Seguridad</h2>
      <div className="space-y-0">
        <ToggleField label="Autenticación de dos factores (2FA)" description="Requerir 2FA para perfiles con acceso financiero" />
        <ToggleField label="Expiración de sesión" description="Cerrar sesión automáticamente después de 30 min de inactividad" defaultChecked />
        <ToggleField label="Bloqueo por intentos fallidos" description="Bloquear cuenta tras 5 intentos fallidos de login" defaultChecked />
        <ToggleField label="Registro de IP" description="Registrar dirección IP en cada acción de auditoría" defaultChecked />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Longitud mínima de contraseña" value="8" type="number" />
        <InputField label="Tiempo de expiración de sesión (min)" value="30" type="number" />
      </div>
      <SaveButton />
    </div>
  );
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-semibold text-card-foreground">Sistema</h2>
      <div className="space-y-0">
        <ToggleField label="Respaldo automático diario" description="Generar respaldo de la base de datos cada 24 horas" defaultChecked />
        <ToggleField label="Modo mantenimiento" description="Desactivar acceso al sistema temporalmente para actualizaciones" />
        <ToggleField label="Logs detallados" description="Registrar todas las consultas y acciones del sistema" defaultChecked />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Retención de logs">
          <select defaultValue="90" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="30">30 días</option>
            <option value="90">90 días</option>
            <option value="180">180 días</option>
            <option value="365">1 año</option>
          </select>
        </FieldGroup>
        <FieldGroup label="Formato de exportación">
          <select defaultValue="xlsx" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
            <option value="pdf">PDF</option>
          </select>
        </FieldGroup>
      </div>
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground mb-2">Último respaldo</p>
        <p className="text-sm font-medium text-card-foreground">2026-03-09 03:00:00 — Exitoso (45.2 MB)</p>
      </div>
      <SaveButton />
    </div>
  );
}
