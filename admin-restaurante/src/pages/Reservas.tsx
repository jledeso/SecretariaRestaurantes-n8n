import { useState, useEffect } from 'react';
import { api, Reserva } from '../lib/supabase';

export default function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>('todas');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getReservasGeneral();
      setReservas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const reservasFiltradas = filtro === 'todas' 
    ? reservas 
    : reservas.filter(r => r.estado === filtro);

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      'pendiente': 'badge-warning',
      'confirmada': 'badge-success',
      'completada': 'badge-info',
      'cancelada': 'badge-error',
      'no_show': 'badge-gray'
    };
    return colors[estado] || 'badge-gray';
  };

  if (loading) return <div className="loading">Cargando reservas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Todas las Reservas</h2>
        <button className="btn btn-secondary" onClick={loadData}>🔄 Actualizar</button>
      </div>

      <div className="filters">
        <label>Filtrar por estado:</label>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="select">
          <option value="todas">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="confirmada">Confirmadas</option>
          <option value="completada">Completadas</option>
          <option value="cancelada">Canceladas</option>
          <option value="no_show">No Show</option>
        </select>
        <span className="filter-count">{reservasFiltradas.length} reservas</span>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Pers.</th>
              <th>Mesa</th>
              <th>Ubicación</th>
              <th>Sillas Niños</th>
              <th>Estado</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {reservasFiltradas.map((r) => (
              <tr key={r.codigo}>
                <td className="font-mono">{r.codigo}</td>
                <td>{new Date(r.fecha).toLocaleDateString('es-ES')}</td>
                <td>{r.hora}</td>
                <td>{r.nombre_cliente}</td>
                <td>{r.telefono}</td>
                <td className="text-center">{r.num_personas}</td>
                <td className="font-mono">{r.mesa_id || '-'}</td>
                <td>{r.ubicacion}</td>
                <td className="text-center">
                  {r.tronas > 0 || r.alzadores > 0 
                    ? `${r.tronas}T / ${r.alzadores}A` 
                    : '-'}
                </td>
                <td>
                  <span className={`badge ${getEstadoColor(r.estado)}`}>
                    {r.estado}
                  </span>
                </td>
                <td className="notas-cell">{r.notas || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
