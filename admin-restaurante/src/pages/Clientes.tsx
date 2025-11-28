import { useState, useEffect } from 'react';
import { api, ClienteFrecuente } from '../lib/supabase';

export default function Clientes() {
  const [clientes, setClientes] = useState<ClienteFrecuente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getClientesFrecuentes();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando clientes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Clientes Frecuentes</h2>
        <button className="btn btn-secondary" onClick={loadData}>🔄 Actualizar</button>
      </div>

      <p className="section-description">
        Clientes con más de una reserva registrada en el sistema.
      </p>

      {clientes.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Total Reservas</th>
                <th>Completadas</th>
                <th>Canceladas</th>
                <th>No Shows</th>
                <th>Primera Reserva</th>
                <th>Última Reserva</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.nombre}</td>
                  <td>{c.telefono}</td>
                  <td className="text-center font-bold">{c.total_reservas}</td>
                  <td className="text-center text-success">{c.completadas}</td>
                  <td className="text-center text-warning">{c.canceladas}</td>
                  <td className="text-center">
                    <span className={Number(c.no_shows) > 0 ? 'text-error' : ''}>
                      {c.no_shows}
                    </span>
                  </td>
                  <td>{new Date(c.primera_reserva).toLocaleDateString('es-ES')}</td>
                  <td>{new Date(c.ultima_reserva).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">No hay clientes frecuentes registrados</p>
      )}
    </div>
  );
}
