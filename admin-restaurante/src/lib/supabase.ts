import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ycklveyiiuyjhpkjmjyp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las respuestas de las funciones RPC
export interface ResumenGeneral {
  metrica: string;
  valor: string;
}

export interface Mesa {
  id: string;
  zona: string;
  area: string;
  numero: number;
  capacidad: number;
  caracteristicas: string;
  activa: boolean;
  created_at: string;
}

export interface MesaPorZona {
  zona: string;
  total_mesas: number;
  capacidad_total: number;
  cap_minima: number;
  cap_maxima: number;
  cap_media: number;
  activas: number;
}

export interface DistribucionCapacidad {
  capacidad: number;
  cantidad: number;
}

export interface Reserva {
  codigo: string;
  fecha: string;
  hora: string;
  nombre_cliente: string;
  telefono: string;
  email: string;
  num_personas: number;
  mesa_id: string;
  ubicacion: string;
  tronas: number;
  alzadores: number;
  estado: string;
  notas: string;
  created_at: string;
}

export interface ReservaHoy {
  hora: string;
  codigo: string;
  nombre_cliente: string;
  telefono: string;
  num_personas: number;
  mesa_id: string;
  area: string;
  sillas_ninos: string;
  estado: string;
  notas: string;
}

export interface ReservaSemana {
  fecha: string;
  dia: string;
  total_reservas: number;
  total_comensales: number;
  tronas: number;
  alzadores: number;
}

export interface EstadisticaEstado {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface OcupacionFranja {
  franja: string;
  reservas: number;
  comensales: number;
}

export interface MesaDisponible {
  id: string;
  zona: string;
  area: string;
  capacidad: number;
  caracteristicas: string;
}

export interface SillasNinos {
  fecha: string;
  tronas_totales: number;
  tronas_reservadas: number;
  tronas_disponibles: number;
  alzadores_totales: number;
  alzadores_reservados: number;
  alzadores_disponibles: number;
}

export interface ClienteFrecuente {
  telefono: string;
  nombre: string;
  total_reservas: number;
  completadas: number;
  canceladas: number;
  no_shows: number;
  primera_reserva: string;
  ultima_reserva: string;
}

export interface AnalisisMensual {
  mes: string;
  total_reservas: number;
  total_comensales: number;
  media_comensales: number;
  completadas: number;
  canceladas: number;
  no_shows: number;
  porcentaje_no_show: number;
}

export interface OcupacionDiaSemana {
  dia: string;
  num_dia: number;
  total_reservas: number;
  total_comensales: number;
  media: number;
}

export interface ZonaPopular {
  zona: string;
  area: string;
  reservas: number;
  comensales: number;
  porcentaje: number;
}

// Funciones de API
export const api = {
  async getResumenGeneral(): Promise<ResumenGeneral[]> {
    const { data, error } = await supabase.rpc('admin_resumen_general');
    if (error) throw error;
    return data || [];
  },

  async getDetalleMesas(): Promise<Mesa[]> {
    const { data, error } = await supabase.rpc('admin_detalle_mesas');
    if (error) throw error;
    return data || [];
  },

  async getMesasPorZona(): Promise<MesaPorZona[]> {
    const { data, error } = await supabase.rpc('admin_mesas_por_zona');
    if (error) throw error;
    return data || [];
  },

  async getDistribucionCapacidades(): Promise<DistribucionCapacidad[]> {
    const { data, error } = await supabase.rpc('admin_distribucion_capacidades');
    if (error) throw error;
    return data || [];
  },

  async getReservasGeneral(): Promise<Reserva[]> {
    const { data, error } = await supabase.rpc('admin_reservas_general');
    if (error) throw error;
    return data || [];
  },

  async getReservasHoy(): Promise<ReservaHoy[]> {
    const { data, error } = await supabase.rpc('admin_reservas_hoy');
    if (error) throw error;
    return data || [];
  },

  async getReservasSemana(): Promise<ReservaSemana[]> {
    const { data, error } = await supabase.rpc('admin_reservas_semana');
    if (error) throw error;
    return data || [];
  },

  async getEstadisticasEstado(): Promise<EstadisticaEstado[]> {
    const { data, error } = await supabase.rpc('admin_estadisticas_estado');
    if (error) throw error;
    return data || [];
  },

  async getOcupacionFranjas(): Promise<OcupacionFranja[]> {
    const { data, error } = await supabase.rpc('admin_ocupacion_franjas');
    if (error) throw error;
    return data || [];
  },

  async getMesasDisponiblesAhora(): Promise<MesaDisponible[]> {
    const { data, error } = await supabase.rpc('admin_mesas_disponibles_ahora');
    if (error) throw error;
    return data || [];
  },

  async getSillasNinos(): Promise<SillasNinos[]> {
    const { data, error } = await supabase.rpc('admin_sillas_ninos');
    if (error) throw error;
    return data || [];
  },

  async getClientesFrecuentes(): Promise<ClienteFrecuente[]> {
    const { data, error } = await supabase.rpc('admin_clientes_frecuentes');
    if (error) throw error;
    return data || [];
  },

  async getAnalisisMensual(): Promise<AnalisisMensual[]> {
    const { data, error } = await supabase.rpc('admin_analisis_mensual');
    if (error) throw error;
    return data || [];
  },

  async getOcupacionDiaSemana(): Promise<OcupacionDiaSemana[]> {
    const { data, error } = await supabase.rpc('admin_ocupacion_dia_semana');
    if (error) throw error;
    return data || [];
  },

  async getZonasPopulares(): Promise<ZonaPopular[]> {
    const { data, error } = await supabase.rpc('admin_zonas_populares');
    if (error) throw error;
    return data || [];
  },

  async getDashboardEjecutivo(): Promise<ResumenGeneral[]> {
    const { data, error } = await supabase.rpc('admin_dashboard_ejecutivo');
    if (error) throw error;
    return data || [];
  }
};
