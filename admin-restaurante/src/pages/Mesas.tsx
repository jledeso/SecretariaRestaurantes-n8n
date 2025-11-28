import { useState, useEffect } from 'react';
import { api, Mesa, MesaPorZona, DistribucionCapacidad, MesaDisponible } from '../lib/supabase';

export default function Mesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [zonas, setZonas] = useState<MesaPorZona[]>([]);
  const [capacidades, setCapacidades] = useState<DistribucionCapacidad[]>([]);
  const [disponibles, setDisponibles] = useState<MesaDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vista, setVista] = useState<'detalle' | 'zonas' | 'capacidades' | 'disponibles'>('detalle');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mesasData, zonasData, capacidadesData, disponiblesData] = await Promise.all([
        api.getDetalleMesas(),
        api.getMesasPorZona(),
        api.getDistribucionCapacidades(),
        api.getMesasDisponiblesAhora()
      ]);
      setMesas(mesasData);
      setZonas(zonasData);
      setCapacidades(capacidadesData);
      setDisponibles(disponiblesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando mesas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Mesas</h2>
        <button className="btn btn-secondary" onClick={loadData}>🔄 Actualizar</button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${vista === 'detalle' ? 'tab-active' : ''}`}
          onClick={() => setVista('detalle')}
        >
          📋 Detalle
        </button>
        <button 
          className={`tab ${vista === 'zonas' ? 'tab-active' : ''}`}
          onClick={() => setVista('zonas')}
        >
          🗺️ Por Zona
        </button>
        <button 
          className={`tab ${vista === 'capacidades' ? 'tab-active' : ''}`}
          onClick={() => setVista('capacidades')}
        >
          👥 Capacidades
        </button>
        <button 
          className={`tab ${vista === 'disponibles' ? 'tab-active' : ''}`}
          onClick={() => setVista('disponibles')}
        >
          ✅ Disponibles Ahora
        </button>
      </div>

      {vista === 'detalle' && (
        <section className="section">
          <h3>Todas las Mesas ({mesas.length})</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Zona</th>
                  <th>Área</th>
                  <th>Nº</th>
                  <th>Capacidad</th>
                  <th>Características</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {mesas.map((mesa) => (
                  <tr key={mesa.id} className={!mesa.activa ? 'row-inactive' : ''}>
                    <td className="font-mono">{mesa.id}</td>
                    <td>{mesa.zona}</td>
                    <td>{mesa.area}</td>
                    <td className="text-center">{mesa.numero}</td>
                    <td className="text-center">{mesa.capacidad}</td>
                    <td>{mesa.caracteristicas || '-'}</td>
                    <td>
                      <span className={`badge ${mesa.activa ? 'badge-success' : 'badge-error'}`}>
                        {mesa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {vista === 'zonas' && (
        <section className="section">
          <h3>Resumen por Zona</h3>
          <div className="cards-grid">
            {zonas.map((zona, idx) => (
              <div key={idx} className="zone-card">
                <h4>{zona.zona}</h4>
                <div className="zone-stats">
                  <div className="zone-stat">
                    <span className="zone-stat-value">{zona.total_mesas}</span>
                    <span className="zone-stat-label">Mesas</span>
                  </div>
                  <div className="zone-stat">
                    <span className="zone-stat-value">{zona.activas}</span>
                    <span className="zone-stat-label">Activas</span>
                  </div>
                  <div className="zone-stat">
                    <span className="zone-stat-value">{zona.capacidad_total}</span>
                    <span className="zone-stat-label">Cap. Total</span>
                  </div>
                  <div className="zone-stat">
                    <span className="zone-stat-value">{zona.cap_minima}-{zona.cap_maxima}</span>
                    <span className="zone-stat-label">Rango</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {vista === 'capacidades' && (
        <section className="section">
          <h3>Distribución de Capacidades</h3>
          <div className="capacity-grid">
            {capacidades.map((cap, idx) => (
              <div key={idx} className="capacity-card">
                <div className="capacity-number">{cap.capacidad}</div>
                <div className="capacity-label">personas</div>
                <div className="capacity-count">{cap.cantidad} mesas</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {vista === 'disponibles' && (
        <section className="section">
          <h3>Mesas Disponibles Ahora ({disponibles.length})</h3>
          {disponibles.length > 0 ? (
            <div className="cards-grid">
              {disponibles.map((mesa) => (
                <div key={mesa.id} className="available-card">
                  <div className="available-header">
                    <span className="available-id">{mesa.id}</span>
                    <span className="available-capacity">{mesa.capacidad} pers.</span>
                  </div>
                  <div className="available-location">
                    {mesa.zona} - {mesa.area}
                  </div>
                  {mesa.caracteristicas && (
                    <div className="available-features">{mesa.caracteristicas}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No hay mesas disponibles en este momento</p>
          )}
        </section>
      )}
    </div>
  );
}
