import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import Developments from "./pages/Developments";
import LotMap from "./pages/LotMap";
import Clients from "./pages/Clients";
import Sales from "./pages/Sales";
import Payments from "./pages/Payments";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/desarrollos" element={<Developments />} />
          <Route path="/mapa/:developmentId" element={<LotMap />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/ventas" element={<Sales />} />
          <Route path="/pagos" element={<Payments />} />
          <Route path="/reportes" element={<ComingSoon title="Reportes" />} />
          <Route path="/auditoria" element={<ComingSoon title="Auditoría" />} />
          <Route path="/configuracion" element={<ComingSoon title="Configuración" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
