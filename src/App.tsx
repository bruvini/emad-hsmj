
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import GestaoUsuariosPage from "./pages/GestaoUsuariosPage";
import PacientesPage from "./pages/PacientesPage";
import AtendimentosPage from "./pages/AtendimentosPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas que usam o layout principal */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/gestao-usuarios" element={<GestaoUsuariosPage />} />
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/atendimentos" element={<AtendimentosPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Rota de login sem o layout */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rota de fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
