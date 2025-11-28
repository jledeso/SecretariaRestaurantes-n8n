import { useState, useEffect } from 'react';
import { api, ReservaHoy, OcupacionFranja } from '../lib/supabase';

export default function ReservasHoy() {
  const [reservas, setReservas] = useState<ReservaHoy[]>([]);
  const [franjas, setFranjas] = useState<OcupacionFranja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservasData, franjasData] = await Promise.all([
        api.getReservasHoy(),
        api.getOcupacionFranjas()
      ]);
      setReservas(reservasData);
      setFranjas(franjasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando reservas de hoy...</div>;
  if (error) return <div className="error">{error}</div>;

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Reservas de Hoy</h2>
          <p className="subtitle">{today}</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData}>🔄 Actualizar</button>
      </div>

      {/* Resumen por franjas */}
      <section className="section">
        <h3>Ocupación por Franja Horaria</h3>
        {franjas.length > 0 ? (
          <div className="franjas-grid">
            {franjas.map((franja, idx) => (
              <div key={idx} className="franja-card">
                <h4>{franja.franja}</h4>
                <div className="franja-stats">
                  <div className="franja-stat">
                    <span className="franja-value">{franja.reservas}</span>
                    <span className="franja-label">reservas</span>
                  </div>
                  <div className="franja-stat">
                    <span className="franja-value">{franja.comensales}</span>
                    <span className="franja-label">comensales</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No hay reservas programadas para hoy</p>
        )}
      </section>

      {/* Lista de reservas */}
      <section className="section">
        <h3>Detalle de Reservas ({reservas.length})</h3>
        {reservas.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Pers.</th>
                  <th>Mesa</th>
                  <th>Área</th>
                  <th>Sillas Niños</th>
                  <th>Estado</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.codigo}>
                    <td className="hora-cell">{r.hora}</td>
                    <td className="font-mono">{r.codigo}</td>
                    <td>{r.nombre_cliente}</td>
                    <td>{r.telefono}</td>
                    <td className="text-center">{r.num_personas}</td>
                    <td className="font-mono">{r.mesa_id || '-'}</td>
                    <td>{r.area || '-'}</td>
                    <td>{r.sillas_ninos}</td>
                    <td>
                      <span className={`badge ${r.estado === 'confirmada' ? 'badge-success' : 'badge-warning'}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="notas-cell">{r.notas || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No hay reservas para hoy</p>
        )}
      </section>
    </div>
  );
}
