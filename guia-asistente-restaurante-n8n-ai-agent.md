# 🍽️ Guía Completa: Asistente de Reservas para Restaurantes con n8n AI Agent

## Sistema 100% n8n - Sin Voiceflow

> **Versión**: 1.0
> **Requisitos**: n8n 1.79.0+ | Supabase | OpenAI/Groq/Gemini
> **Canales**: WhatsApp Business, Telegram, Web Chat integrado de n8n

---

## 📋 Índice

1. [Visión General y Arquitectura](#1-visión-general-y-arquitectura)
2. [Configuración de Supabase](#2-configuración-de-supabase)
3. [Crear Data Tables en n8n](#3-crear-data-tables-en-n8n)
4. [Workflow Principal: AI Agent](#4-workflow-principal-ai-agent)
5. [Configuración de Herramientas (Tools)](#5-configuración-de-herramientas-tools)
6. [Sub-Workflows como Tools](#6-sub-workflows-como-tools)
7. [Integración WhatsApp Business](#7-integración-whatsapp-business)
8. [Integración Telegram](#8-integración-telegram)
9. [Pruebas y Validación](#9-pruebas-y-validación)
10. [Solución de Problemas](#10-solución-de-problemas)

---

## 1. Visión General y Arquitectura

### 🎯 Funcionalidades

| Función | Descripción | Implementación |
|---------|-------------|----------------|
| **Consultar info** | Horarios, ubicación, menú | Knowledge en System Prompt + Data Table |
| **Verificar disponibilidad** | Mesas libres por fecha/hora/zona | Tool → Supabase |
| **Crear reserva** | Con nombre, teléfono, personas | Tool → Supabase |
| **Sillas para niños** | Tronas y alzadores disponibles | Tool → Supabase |
| **Modificar reserva** | Cambiar fecha/hora/personas | Tool → Supabase |
| **Cancelar reserva** | Liberar mesa y sillas | Tool → Supabase |
| **Notificaciones** | Alertar al personal | Tool → Telegram |

### 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CANALES DE ENTRADA                               │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │
│   │  WhatsApp    │   │   Telegram   │   │ n8n Web Chat │               │
│   │  Business    │   │    Bot       │   │  (Integrado) │               │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘               │
└──────────┼──────────────────┼──────────────────┼────────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       WORKFLOW PRINCIPAL n8n                             │
│                                                                          │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐        │
│  │ Webhook/       │    │   AI Agent     │    │ Respond to     │        │
│  │ Chat Trigger   │ →  │   (GPT-4/Llama)│ →  │ Webhook/Chat   │        │
│  └────────────────┘    └───────┬────────┘    └────────────────┘        │
│                                │                                         │
│  ┌─────────────────────────────┼─────────────────────────────────┐      │
│  │                    TOOLS (Herramientas)                        │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │      │
│  │  │ Verificar    │  │ Crear        │  │ Consultar    │         │      │
│  │  │ Disponibilidad│  │ Reserva      │  │ Sillas Niño  │         │      │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │      │
│  │  │ Cancelar     │  │ Modificar    │  │ Notificar    │         │      │
│  │  │ Reserva      │  │ Reserva      │  │ Personal     │         │      │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     MEMORIA Y CONTEXTO                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │    │
│  │  │ Simple Memory│  │ Data Table   │  │ Data Table   │           │    │
│  │  │ (Sesiones)   │  │ (Config)     │  │ (Mesas)      │           │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐              │
│  │    mesas     │  │   reservas   │  │ disponibilidad   │              │
│  │              │  │              │  │ _sillas          │              │
│  └──────────────┘  └──────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 📦 Servicios Necesarios

| Servicio | URL | Propósito | Costo |
|----------|-----|-----------|-------|
| **n8n** | n8n.io | Plataforma principal | Free / Self-hosted |
| **Supabase** | supabase.com | Base de datos PostgreSQL | Free tier |
| **OpenAI** | openai.com | Modelo LLM (GPT-4o-mini) | ~$0.15/1M tokens |
| **Groq** (alt) | groq.com | LLM gratuito (Llama 3.3) | Gratis |
| **WhatsApp** | business.facebook.com | Canal principal | Según uso |
| **Telegram** | telegram.org | Notificaciones + Canal | Gratis |

---

## 2. Configuración de Supabase

### 2.1 Crear Proyecto

1. Ir a **https://supabase.com** → **Start your project**
2. Crear nuevo proyecto:
   - **Name**: `restaurante-reservas`
   - **Database Password**: (guardar de forma segura)
   - **Region**: Más cercana a tu ubicación

3. Guardar credenciales (Settings → API):
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public key**: `eyJ...`
   - **service_role key**: `eyJ...` (secreto)

### 2.2 Crear Tablas

En **SQL Editor**, ejecutar:

```sql
-- =============================================
-- TABLA: mesas
-- Inventario completo de mesas del restaurante
-- =============================================
CREATE TABLE mesas (
  id TEXT PRIMARY KEY,                    -- Ej: M001, M002
  zona TEXT NOT NULL,                     -- Ej: Planta Baja, Primera Planta
  area TEXT NOT NULL,                     -- Ej: Terraza, Salón Principal
  numero INTEGER NOT NULL,                -- Número de mesa dentro del área
  capacidad INTEGER NOT NULL,             -- Máximo de comensales
  caracteristicas TEXT,                   -- Descripción: vistas, esquina, etc.
  activa BOOLEAN DEFAULT true,            -- Si está disponible para reservas
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: reservas
-- Todas las reservas del restaurante
-- =============================================
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE,                     -- Código corto: RES-XXXXX
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  num_personas INTEGER NOT NULL,
  mesa_id TEXT REFERENCES mesas(id),
  tronas INTEGER DEFAULT 0,               -- Sillas para bebés
  alzadores INTEGER DEFAULT 0,            -- Sillas elevadoras para niños
  notas TEXT,                             -- Peticiones especiales
  estado TEXT DEFAULT 'confirmada' 
    CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: disponibilidad_sillas
-- Control de tronas y alzadores por fecha
-- =============================================
CREATE TABLE disponibilidad_sillas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE UNIQUE NOT NULL,
  tronas_totales INTEGER DEFAULT 6,
  tronas_reservadas INTEGER DEFAULT 0,
  alzadores_totales INTEGER DEFAULT 4,
  alzadores_reservadas INTEGER DEFAULT 0
);

-- =============================================
-- ÍNDICES para búsquedas rápidas
-- =============================================
CREATE INDEX idx_reservas_fecha ON reservas(fecha);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_telefono ON reservas(telefono);
CREATE INDEX idx_mesas_zona ON mesas(zona);
CREATE INDEX idx_mesas_capacidad ON mesas(capacidad);
CREATE INDEX idx_mesas_activa ON mesas(activa);

-- =============================================
-- FUNCIÓN: Generar código de reserva
-- =============================================
CREATE OR REPLACE FUNCTION generar_codigo_reserva()
RETURNS TRIGGER AS $$
BEGIN
  NEW.codigo := 'RES-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5));
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_codigo_reserva
  BEFORE INSERT ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION generar_codigo_reserva();

-- =============================================
-- FUNCIÓN: Actualizar timestamp
-- =============================================
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reserva
  BEFORE UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- =============================================
-- FUNCIÓN: Obtener mesas disponibles
-- Parámetros: fecha, hora, número de personas, zona (opcional)
-- =============================================
CREATE OR REPLACE FUNCTION mesas_disponibles(
  p_fecha DATE,
  p_hora TIME,
  p_num_personas INTEGER,
  p_zona TEXT DEFAULT NULL,
  p_duracion_minutos INTEGER DEFAULT 120
)
RETURNS TABLE (
  id TEXT,
  zona TEXT,
  area TEXT,
  numero INTEGER,
  capacidad INTEGER,
  caracteristicas TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.zona, m.area, m.numero, m.capacidad, m.caracteristicas
  FROM mesas m
  WHERE m.activa = true
    AND m.capacidad >= p_num_personas
    AND (p_zona IS NULL OR m.zona ILIKE '%' || p_zona || '%' OR m.area ILIKE '%' || p_zona || '%')
    AND m.id NOT IN (
      SELECT r.mesa_id 
      FROM reservas r 
      WHERE r.fecha = p_fecha 
        AND r.estado IN ('pendiente', 'confirmada')
        AND r.mesa_id IS NOT NULL
        AND (
          -- Verifica solapamiento de horarios
          (r.hora <= p_hora AND (r.hora + (p_duracion_minutos || ' minutes')::INTERVAL) > p_hora)
          OR
          (p_hora <= r.hora AND (p_hora + (p_duracion_minutos || ' minutes')::INTERVAL) > r.hora)
        )
    )
  ORDER BY m.capacidad ASC, m.zona, m.area, m.numero;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN: Verificar sillas disponibles
-- =============================================
CREATE OR REPLACE FUNCTION sillas_disponibles(
  p_fecha DATE,
  p_tronas_totales INTEGER DEFAULT 6,
  p_alzadores_totales INTEGER DEFAULT 4
)
RETURNS TABLE (
  tronas_disponibles INTEGER,
  alzadores_disponibles INTEGER
) AS $$
DECLARE
  v_tronas_reservadas INTEGER;
  v_alzadores_reservadas INTEGER;
BEGIN
  -- Sumar sillas ya reservadas para esa fecha
  SELECT 
    COALESCE(SUM(tronas), 0),
    COALESCE(SUM(alzadores), 0)
  INTO v_tronas_reservadas, v_alzadores_reservadas
  FROM reservas
  WHERE fecha = p_fecha
    AND estado IN ('pendiente', 'confirmada');
  
  RETURN QUERY
  SELECT 
    (p_tronas_totales - v_tronas_reservadas)::INTEGER,
    (p_alzadores_totales - v_alzadores_reservadas)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- HABILITAR Row Level Security
-- =============================================
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad_sillas ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para la API
CREATE POLICY "mesas_select" ON mesas FOR SELECT USING (true);
CREATE POLICY "reservas_all" ON reservas FOR ALL USING (true);
CREATE POLICY "sillas_all" ON disponibilidad_sillas FOR ALL USING (true);
```

### 2.3 Cargar Datos de Mesas

```sql
-- =============================================
-- DATOS DE EJEMPLO: Mesas del restaurante
-- Adaptar según tu inventario real
-- =============================================
INSERT INTO mesas (id, zona, area, numero, capacidad, caracteristicas) VALUES
-- Planta Baja - Terraza
('M001', 'Planta Baja', 'Terraza', 1, 4, 'Primera línea, sombrilla'),
('M002', 'Planta Baja', 'Terraza', 2, 4, 'Primera línea, sombrilla'),
('M003', 'Planta Baja', 'Terraza', 3, 6, 'Esquina, vistas panorámicas'),
('M004', 'Planta Baja', 'Terraza', 4, 2, 'Romántica, junto a jardinera'),
('M005', 'Planta Baja', 'Terraza', 5, 2, 'Romántica, junto a jardinera'),
('M006', 'Planta Baja', 'Terraza', 6, 8, 'Mesa grande, ideal familias'),
-- Planta Baja - Salón Interior
('M007', 'Planta Baja', 'Salón Interior', 1, 4, 'Junto a ventanal'),
('M008', 'Planta Baja', 'Salón Interior', 2, 4, 'Junto a ventanal'),
('M009', 'Planta Baja', 'Salón Interior', 3, 6, 'Centro del salón'),
('M010', 'Planta Baja', 'Salón Interior', 4, 4, 'Rincón acogedor'),
('M011', 'Planta Baja', 'Salón Interior', 5, 2, 'Mesa íntima'),
-- Planta Baja - Barra
('M012', 'Planta Baja', 'Barra', 1, 2, 'Barra alta'),
('M013', 'Planta Baja', 'Barra', 2, 2, 'Barra alta'),
('M014', 'Planta Baja', 'Barra', 3, 3, 'Barra alta, esquina'),
-- Primera Planta
('M015', 'Primera Planta', 'Salón Privado', 1, 12, 'Mesa imperial, eventos'),
('M016', 'Primera Planta', 'Salón Privado', 2, 8, 'Eventos medianos'),
('M017', 'Primera Planta', 'Terraza Superior', 1, 4, 'Vistas espectaculares'),
('M018', 'Primera Planta', 'Terraza Superior', 2, 4, 'Vistas espectaculares'),
('M019', 'Primera Planta', 'Terraza Superior', 3, 6, 'Esquina con pérgola');
```

### 2.4 Configurar Credencial en n8n

1. En n8n: **Credentials** → **Add Credential**
2. Buscar **"Supabase"**
3. Configurar:
   - **Host**: `https://xxxx.supabase.co`
   - **Service Role Secret**: `eyJ...` (service_role key)

---

## 3. Crear Data Tables en n8n

Los **Data Tables** de n8n permiten almacenar configuración del restaurante sin usar variables externas.

### 3.1 Data Table: `config_restaurante`

En n8n: **Projects** → **Data Tables** → **+ New Data Table**

**Nombre**: `config_restaurante`

**Columnas**:
| Columna | Tipo | Descripción |
|---------|------|-------------|
| clave | Text | Identificador único |
| valor | Text | Valor de configuración |
| descripcion | Text | Descripción del campo |

**Datos a insertar**:

| clave | valor | descripcion |
|-------|-------|-------------|
| nombre_restaurante | La Terraza Mediterránea | Nombre comercial |
| nombre_agente | Marina | Nombre del asistente virtual |
| direccion | Paseo Marítimo 45, Valencia | Dirección física |
| telefono | 96 123 45 67 | Teléfono principal |
| horario_comidas | 13:00 a 16:00 | Horario de comidas |
| horario_cenas | 20:00 a 23:30 | Horario de cenas |
| dia_cierre | Lunes (excepto festivos) | Día de cierre |
| precio_medio | 35-45€ por persona | Precio medio carta |
| menu_dia_precio | 18,90€ | Precio menú del día |
| total_tronas | 6 | Tronas disponibles |
| total_alzadores | 4 | Alzadores disponibles |
| max_sillas_reserva | 3 | Máximo sillas por reserva |
| anticipacion_minima | 2 | Horas mínimas antelación |
| anticipacion_maxima | 60 | Días máximos antelación |
| duracion_reserva | 120 | Minutos por reserva |
| telegram_chat_id | -1001234567890 | Chat ID notificaciones |

### 3.2 Data Table: `zonas_restaurante`

**Nombre**: `zonas_restaurante`

**Columnas**:
| Columna | Tipo | Descripción |
|---------|------|-------------|
| zona | Text | Nombre de la zona |
| descripcion | Text | Descripción para clientes |
| disponible | Boolean | Si acepta reservas |

**Datos**:

| zona | descripcion | disponible |
|------|-------------|------------|
| Terraza | Exterior con vistas al mar, sombrillas | true |
| Salón Interior | Ambiente climatizado y acogedor | true |
| Barra | Mesas altas, ideal para aperitivos | true |
| Salón Privado | Espacio exclusivo para eventos (8-20 personas) | true |
| Terraza Superior | Las mejores vistas panorámicas | true |

### 3.3 Data Table: `info_restaurante`

**Nombre**: `info_restaurante`

**Columnas**:
| Columna | Tipo | Descripción |
|---------|------|-------------|
| categoria | Text | Tipo de información |
| contenido | Text | Texto completo |

**Datos**:

| categoria | contenido |
|-----------|-----------|
| especialidades | Paella valenciana tradicional (mín. 2 personas), Arroz a banda, Fideuà de marisco, Pescado fresco del día a la brasa, Carnes a la parrilla |
| menu_dia | De lunes a viernes en comidas: Entrante + Principal + Postre o Café. Bebida incluida. |
| formas_pago | Efectivo, tarjeta, Bizum. No aceptamos cheques. |
| parking | Parking público a 50 metros (2€/hora) |
| accesibilidad | Rampa de acceso y baño adaptado disponibles |
| mascotas | Mascotas permitidas en terraza exterior |
| eventos | Eventos privados en Salón Privado (hasta 20 personas). Solicitar presupuesto. |

---

## 4. Workflow Principal: AI Agent

### 4.1 Estructura del Workflow

```
[Chat Trigger / Webhook]
        │
        ▼
[Obtener Configuración] ─── Data Table: config_restaurante
        │
        ▼
[Set: Preparar Contexto]
        │
        ▼
┌───────┴───────┐
│   AI Agent    │
│  ┌─────────┐  │
│  │ OpenAI  │  │
│  │ Model   │  │
│  └─────────┘  │
│  ┌─────────┐  │
│  │ Simple  │  │
│  │ Memory  │  │
│  └─────────┘  │
│  ┌─────────┐  │
│  │  Tools  │◄─┼── Supabase Tool (Disponibilidad)
│  │         │◄─┼── Supabase Tool (Crear Reserva)
│  │         │◄─┼── Supabase Tool (Sillas)
│  │         │◄─┼── Telegram Tool (Notificar)
│  └─────────┘  │
└───────┬───────┘
        │
        ▼
[Respond to Chat / Webhook]
```

### 4.2 Nodo: Chat Trigger

**Tipo**: `@n8n/n8n-nodes-langchain.chatTrigger`
**Versión**: 1.4

```json
{
  "parameters": {
    "public": true,
    "mode": "hostedChat",
    "initialMessages": "¡Hola! 👋 Soy Marina, tu asistente de reservas.\n¿En qué puedo ayudarte hoy?",
    "options": {
      "title": "Reservas - La Terraza Mediterránea",
      "subtitle": "Asistente de reservas 24/7",
      "inputPlaceholder": "Escribe tu mensaje...",
      "responseMode": "lastNode",
      "allowFileUploads": false
    }
  },
  "type": "@n8n/n8n-nodes-langchain.chatTrigger",
  "typeVersion": 1.4,
  "position": [250, 300],
  "id": "chat-trigger-1",
  "name": "Chat Trigger"
}
```

### 4.3 Nodo: Obtener Configuración

**Tipo**: `n8n-nodes-base.dataTable`

```json
{
  "parameters": {
    "operation": "get",
    "dataTableId": {
      "mode": "list",
      "value": "config_restaurante"
    },
    "returnAll": true
  },
  "type": "n8n-nodes-base.dataTable",
  "typeVersion": 1,
  "position": [450, 300],
  "id": "get-config-1",
  "name": "Obtener Config"
}
```

### 4.4 Nodo: Set - Preparar Contexto

**Tipo**: `n8n-nodes-base.set`

Este nodo transforma los datos del Data Table en variables accesibles:

```json
{
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {
          "name": "chatInput",
          "value": "={{ $('Chat Trigger').item.json.chatInput }}",
          "type": "string"
        },
        {
          "name": "sessionId",
          "value": "={{ $('Chat Trigger').item.json.sessionId }}",
          "type": "string"
        },
        {
          "name": "config",
          "value": "={{ Object.fromEntries($json.map(row => [row.clave, row.valor])) }}",
          "type": "object"
        },
        {
          "name": "fecha_actual",
          "value": "={{ $now.format('yyyy-MM-dd') }}",
          "type": "string"
        },
        {
          "name": "hora_actual",
          "value": "={{ $now.format('HH:mm') }}",
          "type": "string"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [650, 300],
  "id": "set-context-1",
  "name": "Preparar Contexto"
}
```

### 4.5 Nodo: AI Agent

**Tipo**: `@n8n/n8n-nodes-langchain.agent`
**Versión**: 2 o superior

```json
{
  "parameters": {
    "promptType": "define",
    "text": "={{ $json.chatInput }}",
    "options": {
      "systemMessage": "# ROL\nEres {{ $json.config.nombre_agente }}, la asistente virtual de reservas de {{ $json.config.nombre_restaurante }}.\n\n# PERSONALIDAD\n- Amable, eficiente y servicial\n- Hablas de tú a los clientes\n- Transmites la esencia mediterránea y relajada del restaurante\n- Eres proactiva ofreciendo alternativas cuando no hay disponibilidad\n- Conoces perfectamente el restaurante, sus zonas y especialidades\n\n# INFORMACIÓN DEL RESTAURANTE\n- **Nombre**: {{ $json.config.nombre_restaurante }}\n- **Dirección**: {{ $json.config.direccion }}\n- **Teléfono**: {{ $json.config.telefono }}\n- **Horario comidas**: {{ $json.config.horario_comidas }}\n- **Horario cenas**: {{ $json.config.horario_cenas }}\n- **Día de cierre**: {{ $json.config.dia_cierre }}\n- **Precio medio**: {{ $json.config.precio_medio }}\n- **Menú del día**: {{ $json.config.menu_dia_precio }} (L-V comidas)\n\n# ZONAS DISPONIBLES\n1. **Terraza** - Exterior con vistas al mar\n2. **Salón Interior** - Ambiente climatizado\n3. **Barra** - Mesas altas, aperitivos\n4. **Salón Privado** - Eventos (8-20 personas)\n5. **Terraza Superior** - Mejores vistas panorámicas\n\n# SILLAS PARA NIÑOS\n- Tronas disponibles: {{ $json.config.total_tronas }}\n- Alzadores disponibles: {{ $json.config.total_alzadores }}\n- Máximo por reserva: {{ $json.config.max_sillas_reserva }}\n\n# REGLAS DE RESERVA\n- Antelación mínima: {{ $json.config.anticipacion_minima }} horas\n- Antelación máxima: {{ $json.config.anticipacion_maxima }} días\n- Duración reserva: {{ $json.config.duracion_reserva }} minutos\n\n# FECHA Y HORA ACTUAL\n- Fecha: {{ $json.fecha_actual }}\n- Hora: {{ $json.hora_actual }}\n\n# FLUJO DE CONVERSACIÓN\n\n## Para NUEVA RESERVA:\n1. Pregunta: ¿Para cuántas personas?\n2. Pregunta: ¿Qué día y a qué hora? (comida o cena)\n3. Pregunta: ¿Tienes preferencia de zona?\n4. Usa herramienta: verificar_disponibilidad_mesas\n5. Si hay disponibilidad:\n   - Muestra las opciones con sus características\n   - Pide nombre y teléfono de contacto\n   - Pregunta si necesitan trona o alzador\n   - Confirma todos los datos\n   - Usa herramienta: crear_reserva\n   - Proporciona el código de reserva\n6. Si NO hay disponibilidad:\n   - Ofrece alternativas (otra hora, otra zona)\n   - Sugiere días cercanos\n\n## Para CONSULTA DE DISPONIBILIDAD:\n1. Pregunta los datos (personas, fecha, hora)\n2. Usa herramienta: verificar_disponibilidad_mesas\n3. Informa de las opciones disponibles\n4. Ofrece hacer la reserva si le interesa\n\n## Para SILLAS DE NIÑO:\n1. Pregunta para qué fecha\n2. Usa herramienta: consultar_sillas_disponibles\n3. Informa la disponibilidad\n4. Recuerda que se pueden reservar junto con la mesa\n\n## Para CANCELAR RESERVA:\n1. Pide el código de reserva o teléfono\n2. Usa herramienta: buscar_reserva\n3. Confirma los datos de la reserva\n4. Usa herramienta: cancelar_reserva\n5. Confirma la cancelación\n\n## Para CONSULTAS GENERALES:\nResponde sobre horarios, ubicación, carta, eventos, parking, accesibilidad, mascotas usando la información proporcionada.\n\n# IMPORTANTE\n- Siempre confirma la reserva con todos los datos antes de crearla\n- Al finalizar una reserva, proporciona el código y recuerda: \"Te esperamos en {{ $json.config.nombre_restaurante }}, {{ $json.config.direccion }}\"\n- Si preguntan algo que no sabes, ofrece el teléfono {{ $json.config.telefono }}",
      "maxIterations": 10,
      "returnIntermediateSteps": false
    }
  },
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 2,
  "position": [850, 300],
  "id": "ai-agent-1",
  "name": "AI Agent"
}
```

### 4.6 Nodo: OpenAI Chat Model

**Tipo**: `@n8n/n8n-nodes-langchain.lmChatOpenAi`

```json
{
  "parameters": {
    "model": {
      "__rl": true,
      "mode": "list",
      "value": "gpt-4o-mini"
    },
    "options": {
      "temperature": 0.7
    }
  },
  "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
  "typeVersion": 1.2,
  "position": [850, 500],
  "id": "openai-model-1",
  "name": "OpenAI Chat Model",
  "credentials": {
    "openAiApi": {
      "id": "YOUR_CREDENTIAL_ID",
      "name": "OpenAI API"
    }
  }
}
```

### 4.7 Nodo: Simple Memory

**Tipo**: `@n8n/n8n-nodes-langchain.memoryBufferWindow`

```json
{
  "parameters": {
    "sessionIdType": "customKey",
    "sessionKey": "={{ $json.sessionId }}",
    "contextWindowLength": 10
  },
  "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
  "typeVersion": 1.3,
  "position": [850, 650],
  "id": "memory-1",
  "name": "Simple Memory"
}
```

---

## 5. Configuración de Herramientas (Tools)

### 5.1 Tool: Verificar Disponibilidad de Mesas

**Tipo**: `n8n-nodes-base.supabaseTool`

```json
{
  "parameters": {
    "name": "verificar_disponibilidad_mesas",
    "description": "Verifica qué mesas están disponibles para una fecha, hora y número de personas. Devuelve lista de mesas con zona, área, capacidad y características. Parámetros: fecha (formato YYYY-MM-DD), hora (formato HH:MM), num_personas (número), zona (opcional, texto).",
    "method": "POST",
    "operation": "executeFunction",
    "functionName": "mesas_disponibles",
    "functionParams": {
      "p_fecha": "={{ $fromAI('fecha', 'Fecha de la reserva en formato YYYY-MM-DD', 'string') }}",
      "p_hora": "={{ $fromAI('hora', 'Hora de la reserva en formato HH:MM', 'string') }}",
      "p_num_personas": "={{ $fromAI('num_personas', 'Número de personas', 'number') }}",
      "p_zona": "={{ $fromAI('zona', 'Zona preferida: Terraza, Interior, Privado, etc. Dejar vacío si no hay preferencia', 'string') }}"
    }
  },
  "type": "n8n-nodes-base.supabaseTool",
  "typeVersion": 1,
  "position": [1050, 450],
  "id": "tool-disponibilidad",
  "name": "Verificar Disponibilidad",
  "credentials": {
    "supabaseApi": {
      "id": "YOUR_CREDENTIAL_ID",
      "name": "Supabase"
    }
  }
}
```

### 5.2 Tool: Crear Reserva

**Tipo**: `n8n-nodes-base.supabaseTool`

```json
{
  "parameters": {
    "name": "crear_reserva",
    "description": "Crea una nueva reserva en el restaurante. Devuelve el código de confirmación. Requiere: fecha, hora, nombre_cliente, telefono, num_personas, mesa_id. Opcionales: email, tronas, alzadores, notas.",
    "operation": "create",
    "tableId": "reservas",
    "fieldsUi": {
      "fieldValues": [
        {
          "fieldId": "fecha",
          "fieldValue": "={{ $fromAI('fecha', 'Fecha en formato YYYY-MM-DD', 'string') }}"
        },
        {
          "fieldId": "hora",
          "fieldValue": "={{ $fromAI('hora', 'Hora en formato HH:MM', 'string') }}"
        },
        {
          "fieldId": "nombre_cliente",
          "fieldValue": "={{ $fromAI('nombre_cliente', 'Nombre completo del cliente', 'string') }}"
        },
        {
          "fieldId": "telefono",
          "fieldValue": "={{ $fromAI('telefono', 'Teléfono de contacto', 'string') }}"
        },
        {
          "fieldId": "num_personas",
          "fieldValue": "={{ $fromAI('num_personas', 'Número de comensales', 'number') }}"
        },
        {
          "fieldId": "mesa_id",
          "fieldValue": "={{ $fromAI('mesa_id', 'ID de la mesa seleccionada (ej: M001)', 'string') }}"
        },
        {
          "fieldId": "email",
          "fieldValue": "={{ $fromAI('email', 'Email opcional', 'string') }}"
        },
        {
          "fieldId": "tronas",
          "fieldValue": "={{ $fromAI('tronas', 'Número de tronas (sillas bebé), 0 si no necesita', 'number') }}"
        },
        {
          "fieldId": "alzadores",
          "fieldValue": "={{ $fromAI('alzadores', 'Número de alzadores, 0 si no necesita', 'number') }}"
        },
        {
          "fieldId": "notas",
          "fieldValue": "={{ $fromAI('notas', 'Notas o peticiones especiales', 'string') }}"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.supabaseTool",
  "typeVersion": 1,
  "position": [1050, 550],
  "id": "tool-crear-reserva",
  "name": "Crear Reserva",
  "credentials": {
    "supabaseApi": {
      "id": "YOUR_CREDENTIAL_ID",
      "name": "Supabase"
    }
  }
}
```

### 5.3 Tool: Consultar Sillas Disponibles

**Tipo**: `n8n-nodes-base.supabaseTool`

```json
{
  "parameters": {
    "name": "consultar_sillas_disponibles",
    "description": "Consulta la disponibilidad de tronas (sillas para bebé) y alzadores (sillas elevadoras para niños) para una fecha específica.",
    "operation": "executeFunction",
    "functionName": "sillas_disponibles",
    "functionParams": {
      "p_fecha": "={{ $fromAI('fecha', 'Fecha a consultar en formato YYYY-MM-DD', 'string') }}"
    }
  },
  "type": "n8n-nodes-base.supabaseTool",
  "typeVersion": 1,
  "position": [1050, 650],
  "id": "tool-sillas",
  "name": "Consultar Sillas",
  "credentials": {
    "supabaseApi": {
      "id": "YOUR_CREDENTIAL_ID",
      "name": "Supabase"
    }
  }
}
```

### 5.4 Tool: Buscar Reserva

**Tipo**: `n8n-nodes-base.supabaseTool`

```json
{
  "parameters": {
    "name": "buscar_reserva",
    "description": "Busca una reserva existente por código de reserva o por teléfono del cliente. Devuelve los detalles de la reserva.",
    "operation": "getAll",
    "tableId": "reservas",
    "filterType": "manual",
    "matchType": "anyFilter",
    "filters": {
      "conditions": [
        {
          "keyName": "codigo",
          "condition": "eq",
          "keyValue": "={{ $fromAI('codigo', 'Código de reserva (ej: RES-XXXXX)', 'string') }}"
        },
        {
          "keyName": "telefono",
          "condition": "eq",
          "keyValue": "={{ $fromAI('telefono', 'Teléfono del cliente', 'string') }}"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.supabaseTool",
  "typeVersion": 1,
  "position": [1050, 750],
  "id": "tool-buscar-reserva",
  "name": "Buscar Reserva",
  "credentials": {
    "supabaseApi": {
      "id": "YOUR_CREDENTIAL_ID",
      "name": "Supabase"
    }
  }
}
```

### 5.5 Tool: Cancelar Reserva

**Tipo**: `n8n-nodes-base.supabaseTool`

```json
{
  "parameters": {
    "name": "cancelar_reserva",
    "description": "Cancela una reserva existente cambiando su estado a 'cancelada'. Requiere el ID de la reserva (UUID).",
    "operation": "update",
    "tableId": "reservas",
    "filterType": "manual",
    "filters": {
      "conditions": [
        {
          "keyName": "id",
          "condition": "eq",
          "keyValue": "={{ $fromAI('reserva_id', 'UUID de la reserva a cancelar', 'string') }}"
        }
      ]
    },
    "fieldsUi": {
      "fieldValues": [
        {
          "fieldId": "estado",
          "fieldValue": "cancelada"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.supabaseTool",
  "typeVersion": 1,
  "position": [1050, 850],
  "id": "tool-cancelar",
  "name": "Cancelar Reserva",
  "credentials": {
    "supabaseApi": {
      "id": "YOUR_CREDENTIAL_ID",
      "name": "Supabase"
    }
  }
}
```

### 5.6 Tool: Notificar al Personal (Telegram)

**Tipo**: `n8n-nodes-base.telegramTool`

```json
{
  "parameters": {
    "name": "notificar_personal",
    "description": "Envía una notificación al personal del restaurante vía Telegram cuando se crea una nueva reserva importante o hay alguna incidencia.",
    "chatId": "={{ $('Preparar Contexto').item.json.config.telegram_chat_id }}",
    "text": "={{ $fromAI('mensaje', 'Mensaje a enviar al personal del restaurante', 'string') }}",
    "additionalFields": {
      "parse_mode": "Markdown"
    }
  },
  "type": "n8n-nodes-base.telegramTool",
  "typeVersion": 1,
  "position": [1050, 950],
  "id": "tool-telegram",
  "name": "Notificar Personal",
  "credentials": {
    "telegramApi": {
      "id": "YOUR_CREDENTIAL_ID",
      "name": "Telegram Bot"
    }
  }
}
```

---

## 6. Sub-Workflows como Tools

Para operaciones más complejas, puedes crear sub-workflows que el AI Agent puede llamar.

### 6.1 Sub-Workflow: Verificar y Reservar (Completo)

Este sub-workflow verifica disponibilidad y crea la reserva en un solo paso.

**Workflow separado**: `reserva-completa-tool`

```
[Execute Workflow Trigger]
   │ Inputs: fecha, hora, num_personas, zona, nombre, telefono, tronas, alzadores, notas
   │
   ▼
[Supabase: Verificar Disponibilidad]
   │
   ▼
[IF: ¿Hay mesas?]
   │
   ├── Sí ──► [Supabase: Crear Reserva]
   │              │
   │              ▼
   │          [Telegram: Notificar]
   │              │
   │              ▼
   │          [Set: Respuesta Éxito]
   │
   └── No ──► [Set: Respuesta Sin Disponibilidad]
   │
   ▼
[End: Return Data]
```

### 6.2 Nodo: Call n8n Sub-Workflow Tool

En el workflow principal, añadir:

```json
{
  "parameters": {
    "name": "reserva_completa",
    "description": "Ejecuta el proceso completo de reserva: verifica disponibilidad, crea la reserva y notifica al personal. Usar cuando se tienen todos los datos del cliente.",
    "workflowId": {
      "__rl": true,
      "mode": "list",
      "value": "ID_DEL_SUBWORKFLOW"
    },
    "workflowInputs": {
      "value": {
        "fecha": "={{ $fromAI('fecha', 'Fecha YYYY-MM-DD', 'string') }}",
        "hora": "={{ $fromAI('hora', 'Hora HH:MM', 'string') }}",
        "num_personas": "={{ $fromAI('num_personas', 'Número de personas', 'number') }}",
        "zona": "={{ $fromAI('zona', 'Zona preferida', 'string') }}",
        "nombre": "={{ $fromAI('nombre', 'Nombre del cliente', 'string') }}",
        "telefono": "={{ $fromAI('telefono', 'Teléfono', 'string') }}",
        "tronas": "={{ $fromAI('tronas', 'Tronas necesarias', 'number') }}",
        "alzadores": "={{ $fromAI('alzadores', 'Alzadores necesarios', 'number') }}",
        "notas": "={{ $fromAI('notas', 'Notas especiales', 'string') }}"
      },
      "schema": [
        {"id": "fecha", "type": "string", "required": true},
        {"id": "hora", "type": "string", "required": true},
        {"id": "num_personas", "type": "number", "required": true},
        {"id": "zona", "type": "string", "required": false},
        {"id": "nombre", "type": "string", "required": true},
        {"id": "telefono", "type": "string", "required": true},
        {"id": "tronas", "type": "number", "required": false},
        {"id": "alzadores", "type": "number", "required": false},
        {"id": "notas", "type": "string", "required": false}
      ]
    }
  },
  "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
  "typeVersion": 2.2,
  "position": [1250, 550],
  "id": "tool-subworkflow-reserva",
  "name": "Reserva Completa Tool"
}
```

---

## 7. Integración WhatsApp Business

### 7.1 Opción A: Evolution API (Self-hosted)

**Workflow WhatsApp**:

```
[Webhook: /whatsapp-webhook]
   │ Recibe mensaje de Evolution API
   │
   ▼
[Switch: Tipo de mensaje]
   │
   ├── Texto ──► [Set: Extraer mensaje]
   │
   └── Audio ──► [Convert to File] → [OpenAI: Transcribir] → [Set: Extraer texto]
   │
   ▼
[HTTP Request: Llamar workflow principal]
   │ POST al Chat Trigger o usar Execute Workflow
   │
   ▼
[Evolution API: Enviar respuesta]
```

### 7.2 Opción B: WhatsApp Business Cloud API (Meta)

```
[WhatsApp Trigger]
   │ Evento: messages
   │
   ▼
[Set: Preparar mensaje]
   │
   ▼
[Execute Workflow: Workflow Principal AI Agent]
   │
   ▼
[WhatsApp: Send Message]
   │ Recipient: {{ $json.from }}
   │ Message: {{ $json.response }}
```

---

## 8. Integración Telegram

### 8.1 Workflow Telegram Bot

```
[Telegram Trigger]
   │ Updates: message
   │
   ▼
[Set: Preparar datos]
   │ chatInput: {{ $json.message.text }}
   │ sessionId: {{ $json.message.chat.id }}
   │
   ▼
[Execute Workflow: Workflow Principal]
   │
   ▼
[Telegram: Send Message]
   │ Chat ID: {{ $json.message.chat.id }}
   │ Text: {{ $json.output }}
```

### 8.2 Configurar Bot con BotFather

1. Abrir Telegram, buscar `@BotFather`
2. Enviar `/newbot`
3. Nombre: `Reservas La Terraza`
4. Username: `laterraza_reservas_bot`
5. Guardar el **token**

---

## 9. Pruebas y Validación

### 9.1 Checklist Pre-lanzamiento

**Supabase**:
- [ ] Tablas `mesas`, `reservas`, `disponibilidad_sillas` creadas
- [ ] Funciones `mesas_disponibles`, `sillas_disponibles` funcionando
- [ ] Datos de mesas insertados
- [ ] Credencial configurada en n8n

**n8n Data Tables**:
- [ ] `config_restaurante` con todos los valores
- [ ] `zonas_restaurante` con descripciones
- [ ] `info_restaurante` con información adicional

**Workflow Principal**:
- [ ] Chat Trigger configurado
- [ ] AI Agent con System Prompt completo
- [ ] Modelo LLM conectado (OpenAI/Groq)
- [ ] Memory configurada con sessionId
- [ ] Todas las Tools conectadas al Agent

**Canales**:
- [ ] WhatsApp webhook configurado
- [ ] Telegram bot funcionando
- [ ] Web Chat probado

### 9.2 Tests Funcionales

| # | Escenario | Input | Output Esperado |
|---|-----------|-------|-----------------|
| 1 | Saludo | "Hola" | Saludo + oferta de ayuda |
| 2 | Consulta horario | "¿A qué hora abren?" | Horarios comidas y cenas |
| 3 | Disponibilidad | "¿Hay mesa para 4 mañana?" | Pregunta hora y lista opciones |
| 4 | Reserva completa | Dar todos los datos | Confirmación + código |
| 5 | Preferencia zona | "Quiero en terraza" | Mesas de terraza |
| 6 | Sillas niño | "¿Tienen tronas?" | Info tronas/alzadores |
| 7 | Cancelar | "Quiero cancelar" | Pide código, confirma |
| 8 | Sin disponibilidad | Fecha muy solicitada | Alternativas |

### 9.3 Test de Carga

```bash
# Probar el webhook con curl
curl -X POST https://tu-n8n.com/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"chatInput": "Quiero reservar para 4 personas mañana a las 21:00", "sessionId": "test-123"}'
```

---

## 10. Solución de Problemas

### Errores Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| Agent no responde | Modelo no conectado | Verificar credenciales OpenAI |
| Tools no ejecutan | Conexiones mal hechas | Verificar líneas `ai_tool` en JSON |
| Error Supabase | Credencial incorrecta | Usar Service Role Key |
| Memory no funciona | sessionId vacío | Verificar expresión del sessionId |
| Sin mesas disponibles | Query mal formada | Revisar función SQL |
| Telegram no notifica | Chat ID incorrecto | Obtener con @userinfobot |

### Logs y Debugging

1. **n8n Executions**: Ver historial de ejecuciones
2. **AI Agent Steps**: Activar `returnIntermediateSteps: true`
3. **Supabase Logs**: Database → Logs
4. **Telegram Debug**: Enviar mensaje al bot, verificar webhook

### Optimizaciones

1. **Reducir tokens**: System prompt conciso
2. **Cache**: Usar Redis para sesiones largas
3. **Rate limiting**: Configurar en n8n
4. **Fallback**: Añadir modelo secundario

---

## 📊 Conexiones del Workflow (JSON)

```json
{
  "connections": {
    "Chat Trigger": {
      "main": [[{"node": "Obtener Config", "type": "main", "index": 0}]]
    },
    "Obtener Config": {
      "main": [[{"node": "Preparar Contexto", "type": "main", "index": 0}]]
    },
    "Preparar Contexto": {
      "main": [[{"node": "AI Agent", "type": "main", "index": 0}]]
    },
    "OpenAI Chat Model": {
      "ai_languageModel": [[{"node": "AI Agent", "type": "ai_languageModel", "index": 0}]]
    },
    "Simple Memory": {
      "ai_memory": [[{"node": "AI Agent", "type": "ai_memory", "index": 0}]]
    },
    "Verificar Disponibilidad": {
      "ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]
    },
    "Crear Reserva": {
      "ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]
    },
    "Consultar Sillas": {
      "ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]
    },
    "Buscar Reserva": {
      "ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]
    },
    "Cancelar Reserva": {
      "ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]
    },
    "Notificar Personal": {
      "ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]
    }
  }
}
```

---

## ✅ Resumen

Esta guía proporciona una implementación completa de un asistente de reservas para restaurantes usando **exclusivamente n8n**:

- **AI Agent** como cerebro conversacional
- **Data Tables** para configuración parametrizable
- **Supabase** para gestión de mesas y reservas
- **Tools nativos** para operaciones CRUD
- **Multi-canal**: Web Chat, WhatsApp, Telegram

**Ventajas sobre Voiceflow**:
- Todo en una sola plataforma
- Sin costos adicionales de Voiceflow
- Mayor control sobre la lógica
- Personalización total del flujo

---

*Guía n8n AI Agent para Restaurantes v1.0*
