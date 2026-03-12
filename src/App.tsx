import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DevelopmentProvider } from "./contexts/DevelopmentContext";
import Dashboard from "./pages/Dashboard";
import Developments from "./pages/Developments";
import LotMap from "./pages/LotMap";
import Clients from "./pages/Clients";
import Sales from "./pages/Sales";
import NewSale from "./pages/NewSale";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Configuration from "./pages/Configuration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DevelopmentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/desarrollos" element={<Developments />} />
            <Route path="/mapa/:developmentId" element={<LotMap />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/ventas" element={<Sales />} />
            <Route path="/ventas/nueva" element={<NewSale />} />
            <Route path="/pagos" element={<Payments />} />
            <Route path="/reportes" element={<Reports />} />
            <Route path="/auditoria" element={<Audit />} />
            <Route path="/configuracion" element={<Configuration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DevelopmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
