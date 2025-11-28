import { useState, useEffect } from 'react';
import { api, ResumenGeneral, ReservaSemana, EstadisticaEstado } from '../lib/supabase';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<ResumenGeneral[]>([]);
  const [resumen, setResumen] = useState<ResumenGeneral[]>([]);
  const [semana, setSemana] = useState<ReservaSemana[]>([]);
  const [estados, setEstados] = useState<EstadisticaEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, resumenData, semanaData, estadosData] = await Promise.all([
        api.getDashboardEjecutivo(),
        api.getResumenGeneral(),
        api.getReservasSemana(),
        api.getEstadisticasEstado()
      ]);
      setDashboard(dashboardData);
      setResumen(resumenData);
      setSemana(semanaData);
      setEstados(estadosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      'pendiente': '#f59e0b',
      'confirmada': '#10b981',
      'completada': '#3b82f6',
      'cancelada': '#ef4444',
      'no_show': '#6b7280'
    };
    return colors[estado] || '#6b7280';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard Ejecutivo</h2>
        <button className="btn btn-secondary" onClick={loadData}>
          🔄 Actualizar
        </button>
      </div>

      {/* KPIs principales */}
      <section className="dashboard-kpis">
        {dashboard.map((item, idx) => (
          <div key={idx} className="kpi-card">
            <span className="kpi-label">{item.metrica}</span>
            <span className="kpi-value">{item.valor}</span>
          </div>
        ))}
      </section>

      {/* Resumen general */}
      <section className="section">
        <h3>Resumen del Sistema</h3>
        <div className="stats-grid">
          {resumen.map((item, idx) => (
            <div key={idx} className="stat-card">
              <span className="stat-value">{item.valor}</span>
              <span className="stat-label">{item.metrica}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="two-columns">
        {/* Próximos 7 días */}
        <section className="section">
          <h3>Próximos 7 Días</h3>
          {semana.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Día</th>
                    <th>Reservas</th>
                    <th>Comensales</th>
                  </tr>
                </thead>
                <tbody>
                  {semana.map((dia, idx) => (
                    <tr key={idx}>
                      <td>{new Date(dia.fecha).toLocaleDateString('es-ES')}</td>
                      <td>{dia.dia.trim()}</td>
                      <td className="text-center">{dia.total_reservas}</td>
                      <td className="text-center">{dia.total_comensales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No hay reservas para los próximos 7 días</p>
          )}
        </section>

        {/* Estados de reservas */}
        <section className="section">
          <h3>Estado de Reservas</h3>
          {estados.length > 0 ? (
            <div className="estados-list">
              {estados.map((estado, idx) => (
                <div key={idx} className="estado-item">
                  <div className="estado-info">
                    <span 
                      className="estado-badge" 
                      style={{ backgroundColor: getEstadoColor(estado.estado) }}
                    >
                      {estado.estado}
                    </span>
                    <span className="estado-count">{estado.cantidad} reservas</span>
                  </div>
                  <div className="estado-bar-container">
                    <div 
                      className="estado-bar" 
                      style={{ 
                        width: `${estado.porcentaje}%`,
                        backgroundColor: getEstadoColor(estado.estado)
                      }}
                    />
                    <span className="estado-percent">{estado.porcentaje}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No hay datos de estados</p>
          )}
        </section>
      </div>
    </div>
  );
}
