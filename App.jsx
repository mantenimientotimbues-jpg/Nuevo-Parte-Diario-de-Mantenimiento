import React, { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HistorialPage from "./pages/HistorialPage.jsx";
import PaseDeTurnoPage from "./pages/PaseDeTurnoPage.jsx";
import FormularioCargaPage from "./pages/FormularioCargaPage.jsx";
import PedidosDeTrabajoPage from "./pages/PedidosDeTrabajoPage.jsx";
import OrdenDeTrabajoPage from "./pages/OrdenDeTrabajoPage.jsx";
import EquiposPage from "./pages/EquiposPage.jsx";
import HorasAdministradasPage from "./pages/HorasAdministradasPage.jsx";
import ProveedoresPage from "./pages/ProveedoresPage.jsx";
import ConfiguracionPage from "./pages/ConfiguracionPage.jsx";

const PAGINAS = {
  dashboard: DashboardPage,
  historial: HistorialPage,
  paseDeTurno: PaseDeTurnoPage,
  formularioCarga: FormularioCargaPage,
  pedidosDeTrabajo: PedidosDeTrabajoPage,
  ordenDeTrabajo: OrdenDeTrabajoPage,
  equipos: EquiposPage,
  horasAdministradas: HorasAdministradasPage,
  proveedores: ProveedoresPage,
  configuracion: ConfiguracionPage,
};

export default function App() {
  const [paginaActual, setPaginaActual] = useState("dashboard");
  const PaginaActiva = PAGINAS[paginaActual] || DashboardPage;

  return (
    <div className="flex min-h-screen">
      <Sidebar paginaActual={paginaActual} onNavigate={setPaginaActual} />
      <main className="flex-1 p-6 lg:p-8">
        <PaginaActiva onNavigate={setPaginaActual} key={paginaActual} />
      </main>
    </div>
  );
}
