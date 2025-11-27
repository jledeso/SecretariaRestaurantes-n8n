-- =============================================
-- QUERIES DE ADMINISTRACIÓN - Sistema de Reservas Restaurante
-- Proyecto: fichajes (Supabase)
-- =============================================

-- ============================================
-- 1. RESUMEN GENERAL DEL SISTEMA
-- ============================================

-- Vista rápida de todo el inventario
SELECT 
  'Mesas Totales' as metrica, COUNT(*)::TEXT as valor FROM mesas
UNION ALL
SELECT 'Mesas Activas', COUNT(*)::TEXT FROM mesas WHERE activa = true
UNION ALL
SELECT 'Mesas Inactivas', COUNT(*)::TEXT FROM mesas WHERE activa = false
UNION ALL
SELECT 'Capacidad Total', SUM(capacidad)::TEXT FROM mesas WHERE activa = true
UNION ALL
SELECT 'Reservas Totales', COUNT(*)::TEXT FROM reservas
UNION ALL
SELECT 'Reservas Hoy', COUNT(*)::TEXT FROM reservas WHERE fecha = CURRENT_DATE
UNION ALL
SELECT 'Reservas Pendientes', COUNT(*)::TEXT FROM reservas WHERE estado = 'pendiente'
UNION ALL
SELECT 'Reservas Confirmadas', COUNT(*)::TEXT FROM reservas WHERE estado = 'confirmada';


-- ============================================
-- 2. DETALLE COMPLETO DE MESAS
-- ============================================

-- Todas las mesas con su información completa
SELECT 
  id AS "ID Mesa",
  zona AS "Zona",
  area AS "Área",
  numero AS "Nº Mesa",
  capacidad AS "Capacidad",
  caracteristicas AS "Características",
  CASE WHEN activa THEN '✅ Activa' ELSE '❌ Inactiva' END AS "Estado",
  created_at AS "Fecha Creación"
FROM mesas
ORDER BY zona, area, numero;


-- ============================================
-- 3. MESAS POR ZONA Y ÁREA
-- ============================================

-- Resumen de mesas agrupadas por zona
SELECT 
  zona AS "Zona",
  COUNT(*) AS "Total Mesas",
  SUM(capacidad) AS "Capacidad Total",
  MIN(capacidad) AS "Cap. Mínima",
  MAX(capacidad) AS "Cap. Máxima",
  ROUND(AVG(capacidad), 1) AS "Cap. Media",
  SUM(CASE WHEN activa THEN 1 ELSE 0 END) AS "Activas"
FROM mesas
GROUP BY zona
ORDER BY zona;

-- Resumen por área dentro de cada zona
SELECT 
  zona AS "Zona",
  area AS "Área",
  COUNT(*) AS "Mesas",
  SUM(capacidad) AS "Capacidad",
  STRING_AGG(id, ', ' ORDER BY numero) AS "IDs Mesas"
FROM mesas
WHERE activa = true
GROUP BY zona, area
ORDER BY zona, area;


-- ============================================
-- 4. DISTRIBUCIÓN DE CAPACIDADES
-- ============================================

-- Cuántas mesas hay de cada capacidad
SELECT 
  capacidad AS "Capacidad (personas)",
  COUNT(*) AS "Cantidad de Mesas",
  STRING_AGG(id, ', ' ORDER BY id) AS "IDs"
FROM mesas
WHERE activa = true
GROUP BY capacidad
ORDER BY capacidad;


-- ============================================
-- 5. RESERVAS - VISTA GENERAL
-- ============================================

-- Todas las reservas con detalle completo
SELECT 
  r.codigo AS "Código",
  r.fecha AS "Fecha",
  r.hora AS "Hora",
  r.nombre_cliente AS "Cliente",
  r.telefono AS "Teléfono",
  r.email AS "Email",
  r.num_personas AS "Personas",
  r.mesa_id AS "Mesa",
  m.zona || ' - ' || m.area AS "Ubicación",
  r.tronas AS "Tronas",
  r.alzadores AS "Alzadores",
  r.estado AS "Estado",
  r.notas AS "Notas",
  r.created_at AS "Creada",
  r.updated_at AS "Actualizada"
FROM reservas r
LEFT JOIN mesas m ON r.mesa_id = m.id
ORDER BY r.fecha DESC, r.hora;


-- ============================================
-- 6. RESERVAS DE HOY
-- ============================================

SELECT 
  r.hora AS "Hora",
  r.codigo AS "Código",
  r.nombre_cliente AS "Cliente",
  r.telefono AS "Teléfono",
  r.num_personas AS "Pers.",
  r.mesa_id AS "Mesa",
  m.area AS "Área",
  CASE 
    WHEN r.tronas > 0 OR r.alzadores > 0 
    THEN r.tronas || ' tronas, ' || r.alzadores || ' alzadores'
    ELSE '-'
  END AS "Sillas Niños",
  r.estado AS "Estado",
  r.notas AS "Notas"
FROM reservas r
LEFT JOIN mesas m ON r.mesa_id = m.id
WHERE r.fecha = CURRENT_DATE
  AND r.estado IN ('pendiente', 'confirmada')
ORDER BY r.hora;


-- ============================================
-- 7. RESERVAS PRÓXIMOS 7 DÍAS
-- ============================================

SELECT 
  r.fecha AS "Fecha",
  TO_CHAR(r.fecha, 'Day') AS "Día",
  COUNT(*) AS "Total Reservas",
  SUM(r.num_personas) AS "Total Comensales",
  SUM(r.tronas) AS "Tronas",
  SUM(r.alzadores) AS "Alzadores"
FROM reservas r
WHERE r.fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND r.estado IN ('pendiente', 'confirmada')
GROUP BY r.fecha
ORDER BY r.fecha;


-- ============================================
-- 8. ESTADÍSTICAS POR ESTADO DE RESERVA
-- ============================================

SELECT 
  estado AS "Estado",
  COUNT(*) AS "Cantidad",
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reservas), 1) AS "% del Total"
FROM reservas
GROUP BY estado
ORDER BY COUNT(*) DESC;


-- ============================================
-- 9. OCUPACIÓN POR FRANJA HORARIA (HOY)
-- ============================================

SELECT 
  CASE 
    WHEN r.hora < '14:00' THEN 'Comida (13:00-14:00)'
    WHEN r.hora < '16:00' THEN 'Comida (14:00-16:00)'
    WHEN r.hora < '21:00' THEN 'Cena (20:00-21:00)'
    ELSE 'Cena (21:00-23:30)'
  END AS "Franja",
  COUNT(*) AS "Reservas",
  SUM(r.num_personas) AS "Comensales",
  STRING_AGG(r.mesa_id, ', ' ORDER BY r.hora) AS "Mesas Ocupadas"
FROM reservas r
WHERE r.fecha = CURRENT_DATE
  AND r.estado IN ('pendiente', 'confirmada')
GROUP BY 
  CASE 
    WHEN r.hora < '14:00' THEN 'Comida (13:00-14:00)'
    WHEN r.hora < '16:00' THEN 'Comida (14:00-16:00)'
    WHEN r.hora < '21:00' THEN 'Cena (20:00-21:00)'
    ELSE 'Cena (21:00-23:30)'
  END
ORDER BY "Franja";


-- ============================================
-- 10. MESAS DISPONIBLES AHORA
-- ============================================

-- Mesas que NO tienen reserva activa en este momento
SELECT 
  m.id AS "Mesa",
  m.zona AS "Zona",
  m.area AS "Área",
  m.capacidad AS "Capacidad",
  m.caracteristicas AS "Características"
FROM mesas m
WHERE m.activa = true
  AND m.id NOT IN (
    SELECT r.mesa_id 
    FROM reservas r 
    WHERE r.fecha = CURRENT_DATE 
      AND r.estado IN ('pendiente', 'confirmada')
      AND r.mesa_id IS NOT NULL
      AND r.hora <= CURRENT_TIME 
      AND (r.hora + INTERVAL '2 hours') > CURRENT_TIME
  )
ORDER BY m.capacidad, m.zona, m.area;


-- ============================================
-- 11. DISPONIBILIDAD DE SILLAS PARA NIÑOS
-- ============================================

-- Sillas reservadas por fecha (próximos 7 días)
SELECT 
  r.fecha AS "Fecha",
  6 AS "Tronas Totales",
  COALESCE(SUM(r.tronas), 0) AS "Tronas Reservadas",
  6 - COALESCE(SUM(r.tronas), 0) AS "Tronas Disponibles",
  4 AS "Alzadores Totales",
  COALESCE(SUM(r.alzadores), 0) AS "Alzadores Reservados",
  4 - COALESCE(SUM(r.alzadores), 0) AS "Alzadores Disponibles"
FROM reservas r
WHERE r.fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND r.estado IN ('pendiente', 'confirmada')
GROUP BY r.fecha
ORDER BY r.fecha;


-- ============================================
-- 12. CLIENTES FRECUENTES
-- ============================================

SELECT 
  telefono AS "Teléfono",
  MAX(nombre_cliente) AS "Nombre",
  COUNT(*) AS "Total Reservas",
  COUNT(*) FILTER (WHERE estado = 'completada') AS "Completadas",
  COUNT(*) FILTER (WHERE estado = 'cancelada') AS "Canceladas",
  COUNT(*) FILTER (WHERE estado = 'no_show') AS "No Shows",
  MIN(fecha) AS "Primera Reserva",
  MAX(fecha) AS "Última Reserva"
FROM reservas
GROUP BY telefono
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;


-- ============================================
-- 13. RESERVAS CANCELADAS (ÚLTIMOS 30 DÍAS)
-- ============================================

SELECT 
  codigo AS "Código",
  fecha AS "Fecha",
  hora AS "Hora",
  nombre_cliente AS "Cliente",
  telefono AS "Teléfono",
  num_personas AS "Personas",
  mesa_id AS "Mesa",
  notas AS "Notas",
  updated_at AS "Fecha Cancelación"
FROM reservas
WHERE estado = 'cancelada'
  AND updated_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY updated_at DESC;


-- ============================================
-- 14. NO SHOWS (ÚLTIMOS 30 DÍAS)
-- ============================================

SELECT 
  codigo AS "Código",
  fecha AS "Fecha",
  hora AS "Hora",
  nombre_cliente AS "Cliente",
  telefono AS "Teléfono",
  num_personas AS "Personas",
  mesa_id AS "Mesa"
FROM reservas
WHERE estado = 'no_show'
  AND fecha >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY fecha DESC;


-- ============================================
-- 15. ANÁLISIS MENSUAL
-- ============================================

SELECT 
  TO_CHAR(fecha, 'YYYY-MM') AS "Mes",
  COUNT(*) AS "Total Reservas",
  SUM(num_personas) AS "Total Comensales",
  ROUND(AVG(num_personas), 1) AS "Media Comensales/Reserva",
  COUNT(*) FILTER (WHERE estado = 'completada') AS "Completadas",
  COUNT(*) FILTER (WHERE estado = 'cancelada') AS "Canceladas",
  COUNT(*) FILTER (WHERE estado = 'no_show') AS "No Shows",
  ROUND(
    COUNT(*) FILTER (WHERE estado = 'no_show') * 100.0 / NULLIF(COUNT(*), 0), 
    1
  ) AS "% No Show"
FROM reservas
GROUP BY TO_CHAR(fecha, 'YYYY-MM')
ORDER BY "Mes" DESC;


-- ============================================
-- 16. OCUPACIÓN POR DÍA DE LA SEMANA
-- ============================================

SELECT 
  TO_CHAR(fecha, 'Day') AS "Día",
  EXTRACT(DOW FROM fecha) AS "Nº Día",
  COUNT(*) AS "Total Reservas",
  SUM(num_personas) AS "Total Comensales",
  ROUND(AVG(num_personas), 1) AS "Media"
FROM reservas
WHERE estado IN ('confirmada', 'completada')
GROUP BY TO_CHAR(fecha, 'Day'), EXTRACT(DOW FROM fecha)
ORDER BY EXTRACT(DOW FROM fecha);


-- ============================================
-- 17. ZONAS MÁS SOLICITADAS
-- ============================================

SELECT 
  m.zona AS "Zona",
  m.area AS "Área",
  COUNT(r.id) AS "Reservas",
  SUM(r.num_personas) AS "Comensales",
  ROUND(
    COUNT(r.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM reservas WHERE mesa_id IS NOT NULL), 0),
    1
  ) AS "% del Total"
FROM reservas r
JOIN mesas m ON r.mesa_id = m.id
WHERE r.estado IN ('confirmada', 'completada')
GROUP BY m.zona, m.area
ORDER BY COUNT(r.id) DESC;


-- ============================================
-- 18. VERIFICAR INTEGRIDAD DE DATOS
-- ============================================

-- Reservas sin mesa asignada
SELECT 
  'Reservas sin mesa' AS "Problema",
  COUNT(*) AS "Cantidad"
FROM reservas 
WHERE mesa_id IS NULL 
  AND estado IN ('pendiente', 'confirmada');

-- Reservas con mesa inexistente
SELECT 
  'Reservas con mesa inválida' AS "Problema",
  COUNT(*) AS "Cantidad"
FROM reservas r
LEFT JOIN mesas m ON r.mesa_id = m.id
WHERE r.mesa_id IS NOT NULL AND m.id IS NULL;

-- Mesas con capacidad insuficiente para la reserva
SELECT 
  r.codigo AS "Reserva",
  r.num_personas AS "Personas",
  m.id AS "Mesa",
  m.capacidad AS "Capacidad Mesa"
FROM reservas r
JOIN mesas m ON r.mesa_id = m.id
WHERE r.num_personas > m.capacidad
  AND r.estado IN ('pendiente', 'confirmada');


-- ============================================
-- 19. RESUMEN EJECUTIVO (DASHBOARD)
-- ============================================

WITH stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE fecha = CURRENT_DATE AND estado IN ('pendiente', 'confirmada')) as reservas_hoy,
    SUM(num_personas) FILTER (WHERE fecha = CURRENT_DATE AND estado IN ('pendiente', 'confirmada')) as comensales_hoy,
    COUNT(*) FILTER (WHERE fecha = CURRENT_DATE + 1 AND estado IN ('pendiente', 'confirmada')) as reservas_manana,
    COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE AND fecha < CURRENT_DATE + 7 AND estado IN ('pendiente', 'confirmada')) as reservas_semana,
    COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes_confirmar
  FROM reservas
),
mesas_stats AS (
  SELECT 
    COUNT(*) as total_mesas,
    SUM(capacidad) as capacidad_total
  FROM mesas 
  WHERE activa = true
)
SELECT 
  '📅 Reservas Hoy' as "Métrica", 
  COALESCE(s.reservas_hoy, 0)::TEXT || ' (' || COALESCE(s.comensales_hoy, 0)::TEXT || ' comensales)' as "Valor"
FROM stats s
UNION ALL
SELECT '📆 Reservas Mañana', COALESCE(reservas_manana, 0)::TEXT FROM stats
UNION ALL
SELECT '📊 Reservas Esta Semana', COALESCE(reservas_semana, 0)::TEXT FROM stats
UNION ALL
SELECT '⏳ Pendientes Confirmar', COALESCE(pendientes_confirmar, 0)::TEXT FROM stats
UNION ALL
SELECT '🪑 Mesas Activas', total_mesas::TEXT FROM mesas_stats
UNION ALL
SELECT '👥 Capacidad Total', capacidad_total::TEXT || ' personas' FROM mesas_stats;
