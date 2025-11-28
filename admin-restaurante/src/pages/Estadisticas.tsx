import { useState, useEffect } from 'react';
import { api, AnalisisMensual, OcupacionDiaSemana, ZonaPopular } from '../lib/supabase';

export default function Estadisticas() {
  const [mensual, setMensual] = useState<AnalisisMensual[]>([]);
  const [diaSemana, setDiaSemana] = useState<OcupacionDiaSemana[]>([]);
  const [zonas, setZonas] = useState<ZonaPopular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mensualData, diaData, zonasData] = await Promise.all([
        api.getAnalisisMensual(),
        api.getOcupacionDiaSemana(),
        api.getZonasPopulares()
      ]);
      setMensual(mensualData);
      setDiaSemana(diaData);
      setZonas(zonasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando estadísticas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Estadísticas y Análisis</h2>
        <button className="btn btn-secondary" onClick={loadData}>🔄 Actualizar</button>
      </div>

      {/* Ocupación por día de semana */}
      <section className="section">
        <h3>Ocupación por Día de la Semana</h3>
        {diaSemana.length > 0 ? (
          <div className="weekday-chart">
            {diaSemana.map((dia, idx) => {
              const maxReservas = Math.max(...diaSemana.map(d => Number(d.total_reservas)));
              const percentage = maxReservas > 0 ? (Number(dia.total_reservas) / maxReservas) * 100 : 0;
              return (
                <div key={idx} className="weekday-bar">
                  <span className="weekday-name">{dia.dia}</span>
                  <div className="weekday-bar-container">
                    <div 
                      className="weekday-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="weekday-value">{dia.total_reservas} ({dia.total_comensales} pers.)</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">No hay datos disponibles</p>
        )}
      </section>

      {/* Zonas más populares */}
      <section className="section">
        <h3>Zonas Más Solicitadas</h3>
        {zonas.length > 0 ? (
          <div className="zones-chart">
            {zonas.map((zona, idx) => (
              <div key={idx} className="zone-bar">
                <div className="zone-info">
                  <span className="zone-name">{zona.zona} - {zona.area}</span>
                  <span className="zone-percent">{zona.porcentaje}%</span>
                </div>
                <div className="zone-bar-container">
                  <div 
                    className="zone-bar-fill" 
                    style={{ width: `${zona.porcentaje}%` }}
                  />
                </div>
                <span className="zone-stats">{zona.reservas} reservas · {zona.comensales} comensales</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No hay datos de zonas</p>
        )}
      </section>

      {/* Análisis mensual */}
      <section className="section">
        <h3>Análisis Mensual</h3>
        {mensual.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Reservas</th>
                  <th>Comensales</th>
                  <th>Media/Reserva</th>
                  <th>Completadas</th>
                  <th>Canceladas</th>
                  <th>No Shows</th>
                  <th>% No Show</th>
                </tr>
              </thead>
              <tbody>
                {mensual.map((m, idx) => (
                  <tr key={idx}>
                    <td>{m.mes}</td>
                    <td className="text-center">{m.total_reservas}</td>
                    <td className="text-center">{m.total_comensales}</td>
                    <td className="text-center">{m.media_comensales}</td>
                    <td className="text-center text-success">{m.completadas}</td>
                    <td className="text-center text-warning">{m.canceladas}</td>
                    <td className="text-center text-error">{m.no_shows}</td>
                    <td className="text-center">
                      <span className={Number(m.porcentaje_no_show) > 10 ? 'text-error' : ''}>
                        {m.porcentaje_no_show}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No hay datos mensuales</p>
        )}
      </section>
    </div>
  );
}
