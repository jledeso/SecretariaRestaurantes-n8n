import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Mesas from './pages/Mesas';
import Reservas from './pages/Reservas';
import ReservasHoy from './pages/ReservasHoy';
import Semana from './pages/Semana';
import Estadisticas from './pages/Estadisticas';
import Clientes from './pages/Clientes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mesas" element={<Mesas />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="hoy" element={<ReservasHoy />} />
          <Route path="semana" element={<Semana />} />
          <Route path="estadisticas" element={<Estadisticas />} />
          <Route path="clientes" element={<Clientes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
