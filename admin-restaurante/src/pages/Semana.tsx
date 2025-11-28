import { useState, useEffect } from 'react';
import { api, ReservaSemana, SillasNinos } from '../lib/supabase';

export default function Semana() {
  const [semana, setSemana] = useState<ReservaSemana[]>([]);
  const [sillas, setSillas] = useState<SillasNinos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [semanaData, sillasData] = await Promise.all([
        api.getReservasSemana(),
        api.getSillasNinos()
      ]);
      setSemana(semanaData);
      setSillas(sillasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando datos de la semana...</div>;
  if (error) return <div className="error">{error}</div>;

  const totalReservas = semana.reduce((acc, d) => acc + Number(d.total_reservas), 0);
  const totalComensales = semana.reduce((acc, d) => acc + Number(d.total_comensales), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Próximos 7 Días</h2>
        <button className="btn btn-secondary" onClick={loadData}>🔄 Actualizar</button>
      </div>

      {/* Resumen */}
      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-value">{totalReservas}</span>
          <span className="summary-label">Reservas Totales</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{totalComensales}</span>
          <span className="summary-label">Comensales Esperados</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{semana.length}</span>
          <span className="summary-label">Días con Reservas</span>
        </div>
      </div>

      {/* Reservas por día */}
      <section className="section">
        <h3>Reservas por Día</h3>
        {semana.length > 0 ? (
          <div className="week-grid">
            {semana.map((dia, idx) => (
              <div key={idx} className="day-card">
                <div className="day-header">
                  <span className="day-name">{dia.dia.trim()}</span>
                  <span className="day-date">
                    {new Date(dia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="day-content">
                  <div className="day-stat main">
                    <span className="day-value">{dia.total_reservas}</span>
                    <span className="day-label">reservas</span>
                  </div>
                  <div className="day-stat">
                    <span className="day-value">{dia.total_comensales}</span>
                    <span className="day-label">comensales</span>
                  </div>
                  {(Number(dia.tronas) > 0 || Number(dia.alzadores) > 0) && (
                    <div className="day-extras">
                      {Number(dia.tronas) > 0 && <span>🪑 {dia.tronas} tronas</span>}
                      {Number(dia.alzadores) > 0 && <span>⬆️ {dia.alzadores} alzadores</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No hay reservas para los próximos 7 días</p>
        )}
      </section>

      {/* Disponibilidad de sillas para niños */}
      <section className="section">
        <h3>Disponibilidad de Sillas para Niños</h3>
        {sillas.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tronas Reservadas</th>
                  <th>Tronas Disponibles</th>
                  <th>Alzadores Reservados</th>
                  <th>Alzadores Disponibles</th>
                </tr>
              </thead>
              <tbody>
                {sillas.map((s, idx) => (
                  <tr key={idx}>
                    <td>{new Date(s.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                    <td className="text-center">{s.tronas_reservadas} / {s.tronas_totales}</td>
                    <td className="text-center">
                      <span className={s.tronas_disponibles <= 1 ? 'text-warning' : ''}>
                        {s.tronas_disponibles}
                      </span>
                    </td>
                    <td className="text-center">{s.alzadores_reservados} / {s.alzadores_totales}</td>
                    <td className="text-center">
                      <span className={s.alzadores_disponibles <= 1 ? 'text-warning' : ''}>
                        {s.alzadores_disponibles}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No hay reservas con sillas para niños</p>
        )}
      </section>
    </div>
  );
}
