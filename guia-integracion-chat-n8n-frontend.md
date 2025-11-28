# 💬 Guía Completa: Integración del Chat n8n en Frontend React

## Sistema de Chat AI para Restaurantes - Admin Panel

> **Versión**: 1.0  
> **Requisitos**: n8n 1.79.0+ | React 18+ | @n8n/chat 0.67.0+  
> **Workflow**: `Asistente_Reservas_Restaurante_AI_Agent.json`

---

## ⚡ Cambios Realizados en el Workflow (28/11/2025)

Se han aplicado los siguientes cambios al archivo `Asistente_Reservas_Restaurante_AI_Agent.json` para habilitar la integración con frontend externo:

### Modificaciones en el nodo Chat Trigger:

| Parámetro | Antes | Después | Motivo |
|-----------|-------|---------|--------|
| `allowedOrigins` | ❌ No existía | `"*"` | Permite CORS desde cualquier origen (necesario para desarrollo) |
| `loadPreviousSession` | ❌ No existía | `"notSupported"` | Indica que la carga de sesiones anteriores no está soportada |

### Configuración Final del Chat Trigger:

```json
{
  "options": {
    "allowFileUploads": false,
    "allowedOrigins": "*",
    "inputPlaceholder": "Escribe tu mensaje aquí...",
    "loadPreviousSession": "notSupported",
    "showWelcomeScreen": false,
    "subtitle": "Asistente de reservas 24/7",
    "title": "🍽️ La Terraza Mediterránea",
    "responseMode": "lastNode"
  }
}
```

### ⚠️ Importante para Producción:

Para entornos de producción, cambiar `allowedOrigins` de `"*"` a los dominios específicos:

```json
"allowedOrigins": "https://tu-dominio.com,https://admin.tu-dominio.com"
```

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Arquitectura de Integración](#2-arquitectura-de-integración)
3. [Configuración del Chat Trigger en n8n](#3-configuración-del-chat-trigger-en-n8n)
4. [Instalación en el Frontend](#4-instalación-en-el-frontend)
5. [Métodos de Integración](#5-métodos-de-integración)
6. [Componente Chat Personalizado](#6-componente-chat-personalizado)
7. [Configuración Avanzada](#7-configuración-avanzada)
8. [Estilos y Personalización](#8-estilos-y-personalización)
9. [Manejo de Sesiones y Memoria](#9-manejo-de-sesiones-y-memoria)
10. [CORS y Seguridad](#10-cors-y-seguridad)
11. [Streaming de Respuestas](#11-streaming-de-respuestas)
12. [Solución de Problemas](#12-solución-de-problemas)
13. [Checklist de Implementación](#13-checklist-de-implementación)

---

## 1. Visión General

### 🎯 Objetivo

Integrar el asistente de reservas AI de n8n directamente en el panel de administración del restaurante, permitiendo:

- **Clientes**: Acceso al chat desde una página pública del sitio web
- **Personal**: Uso del chat para consultas rápidas desde el panel admin
- **Pruebas**: Interfaz de testing para el equipo de desarrollo

### 📦 Componentes Involucrados

| Componente | Descripción |
|------------|-------------|
| **n8n Chat Trigger** | Nodo que recibe mensajes y los procesa con el AI Agent |
| **@n8n/chat** | Widget oficial de n8n para integrar chat en websites |
| **Frontend React** | Panel de administración `admin-restaurante` |
| **Webhook URL** | Endpoint público del workflow en n8n |

### 🔄 Flujo de Comunicación

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React App)                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    @n8n/chat Widget                           │   │
│  │                                                               │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │   │
│  │  │ Chat Input  │ ─► │ Send POST   │ ─► │ Display     │      │   │
│  │  │ (Usuario)   │    │ to Webhook  │    │ Response    │      │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ HTTPS POST
                                │ ?action=sendMessage
                                │ Body: { chatInput, sessionId }
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        n8n (Workflow)                                │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │ Chat Trigger │ ─► │  AI Agent    │ ─► │ JSON Response        │  │
│  │ (Webhook)    │    │  + Tools     │    │ { output: "..." }    │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│                             │                                        │
│                             ▼                                        │
│                    ┌──────────────┐                                  │
│                    │   Supabase   │                                  │
│                    │   (Data)     │                                  │
│                    └──────────────┘                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura de Integración

### 2.1 Estructura de Archivos

```
admin-restaurante/
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── N8nChat.tsx          # ← Nuevo componente
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Reservas.tsx
│   │   ├── Chat.tsx             # ← Nueva página (opcional)
│   │   └── ...
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── n8n-chat-config.ts   # ← Nueva configuración
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── .env
├── .env.example
└── package.json
```

### 2.2 Variables de Entorno

Añadir al archivo `.env`:

```bash
# n8n Chat Configuration
VITE_N8N_WEBHOOK_URL=https://tu-n8n-instance.com/webhook/WEBHOOK_ID/chat
VITE_N8N_CHAT_PUBLIC=true

# Supabase (ya existentes)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Actualizar `.env.example`:

```bash
# n8n Chat Configuration
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id/chat
VITE_N8N_CHAT_PUBLIC=true

# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 3. Configuración del Chat Trigger en n8n

### 3.1 Obtener la URL del Webhook

1. Abre el workflow `Asistente_Reservas_Restaurante_AI_Agent` en n8n
2. Haz clic en el nodo **Chat Trigger**
3. Copia la **Webhook URL** (Production o Test según el caso)

La URL tendrá el formato:
```
https://tu-n8n.com/webhook/WEBHOOK_ID/chat
```

### 3.2 Configuración del Chat Trigger

> ✅ **ACTUALIZADO**: El archivo `Asistente_Reservas_Restaurante_AI_Agent.json` ya incluye estos cambios.

```json
{
  "parameters": {
    "public": true,
    "initialMessages": "¡Hola! 👋 Soy Marina...",
    "options": {
      "allowFileUploads": false,
      "allowedOrigins": "*",
      "inputPlaceholder": "Escribe tu mensaje aquí...",
      "loadPreviousSession": "notSupported",
      "showWelcomeScreen": false,
      "subtitle": "Asistente de reservas 24/7",
      "title": "🍽️ La Terraza Mediterránea",
      "responseMode": "lastNode"
    }
  },
  "type": "@n8n/n8n-nodes-langchain.chatTrigger",
  "typeVersion": 1.4,
  "name": "Chat Trigger",
  "webhookId": "reservas-restaurante-chat"
}
```

### 3.3 Opciones Importantes del Chat Trigger

| Opción | Valor Recomendado | Descripción |
|--------|-------------------|-------------|
| **public** | `true` | Permite acceso sin autenticación n8n |
| **mode** | `webhook` | Modo embebido para uso externo |
| **allowedOrigins** | `"*"` o dominios específicos | CORS - orígenes permitidos |
| **responseMode** | `lastNode` | Responde con output del último nodo |
| **loadPreviousSession** | `fromMemory` | Carga historial de sesión anterior |

### 3.4 Modos de Chat Trigger

| Modo | Uso | Descripción |
|------|-----|-------------|
| **hostedChat** | Chat integrado en n8n | Usa la interfaz de chat de n8n |
| **webhook** | Frontend externo | Para integrar con @n8n/chat o custom |

> ⚠️ **IMPORTANTE**: Para integración en frontend externo, usar `mode: "webhook"`

---

## 4. Instalación en el Frontend

### 4.1 Instalar Dependencia

```bash
cd admin-restaurante
npm install @n8n/chat
```

### 4.2 Verificar package.json

```json
{
  "dependencies": {
    "@n8n/chat": "^0.67.0",
    "@supabase/supabase-js": "^2.86.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.6"
  }
}
```

### 4.3 Importar Estilos Base

En `src/main.tsx` o `src/App.tsx`:

```tsx
import '@n8n/chat/style.css';
```

---

## 5. Métodos de Integración

Existen **3 métodos** principales para integrar el chat de n8n:

### Método A: CDN Embed (Sin npm)

Para páginas HTML estáticas o sitios sin bundler:

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" rel="stylesheet" />
</head>
<body>
  <script type="module">
    import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
    
    createChat({
      webhookUrl: 'https://tu-n8n.com/webhook/WEBHOOK_ID/chat',
      mode: 'window',
      showWelcomeScreen: false,
      initialMessages: [
        '¡Hola! 👋 Soy Marina, tu asistente de reservas.',
        '¿En qué puedo ayudarte hoy?'
      ],
      i18n: {
        es: {
          title: '🍽️ Reservas',
          subtitle: 'Asistente 24/7',
          inputPlaceholder: 'Escribe tu mensaje...',
          footer: ''
        }
      },
      defaultLanguage: 'es'
    });
  </script>
</body>
</html>
```

### Método B: Import en React (Recomendado)

Para aplicaciones React con Vite/Webpack:

```tsx
// src/components/N8nChat.tsx
import { useEffect } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

export default function N8nChat() {
  useEffect(() => {
    createChat({
      webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
      mode: 'window', // 'window' | 'fullscreen'
      showWelcomeScreen: false,
      initialMessages: [
        '¡Hola! 👋 Soy Marina, tu asistente de reservas de La Terraza Mediterránea.',
        '¿En qué puedo ayudarte hoy?'
      ],
      i18n: {
        es: {
          title: '🍽️ La Terraza Mediterránea',
          subtitle: 'Asistente de reservas 24/7',
          inputPlaceholder: 'Escribe tu mensaje aquí...',
          getStarted: 'Nueva conversación',
          closeButtonTooltip: 'Cerrar chat',
          footer: ''
        }
      },
      defaultLanguage: 'es'
    });
  }, []);

  return null; // El chat se monta automáticamente en el DOM
}
```

### Método C: Webhook Manual (Control Total)

Para máximo control sobre la UI:

```tsx
// src/hooks/useN8nChat.ts
import { useState, useCallback } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useN8nChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_N8N_WEBHOOK_URL}?action=sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatInput: content,
            sessionId,
            action: 'sendMessage'
          })
        }
      );

      if (!response.ok) throw new Error('Error en la respuesta');

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.output || data.text || 'Sin respuesta',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor, intenta de nuevo.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return { messages, sendMessage, isLoading, sessionId };
}
```

---

## 6. Componente Chat Personalizado

### 6.1 Componente Completo con @n8n/chat

```tsx
// src/components/N8nChat.tsx
import { useEffect, useRef } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

interface N8nChatProps {
  mode?: 'window' | 'fullscreen';
  target?: string;
  showWelcomeScreen?: boolean;
  allowedFilesMimeTypes?: string;
  allowFileUploads?: boolean;
}

export default function N8nChat({
  mode = 'window',
  target,
  showWelcomeScreen = false,
  allowFileUploads = false,
  allowedFilesMimeTypes
}: N8nChatProps) {
  const chatInitialized = useRef(false);

  useEffect(() => {
    if (chatInitialized.current) return;
    chatInitialized.current = true;

    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('VITE_N8N_WEBHOOK_URL no está configurada');
      return;
    }

    createChat({
      webhookUrl,
      mode,
      target,
      showWelcomeScreen,
      allowFileUploads,
      allowedFilesMimeTypes,
      
      // Mensajes iniciales
      initialMessages: [
        '¡Hola! 👋 Soy Marina, tu asistente de reservas.',
        '¿En qué puedo ayudarte hoy?\n\n• Hacer una reserva\n• Consultar disponibilidad\n• Cancelar o modificar reserva\n• Información del restaurante'
      ],

      // Internacionalización
      i18n: {
        es: {
          title: '🍽️ La Terraza Mediterránea',
          subtitle: 'Asistente de reservas 24/7',
          inputPlaceholder: 'Escribe tu mensaje aquí...',
          getStarted: 'Nueva conversación',
          closeButtonTooltip: 'Cerrar chat',
          footer: ''
        }
      },
      defaultLanguage: 'es',

      // Metadatos adicionales enviados con cada mensaje
      metadata: {
        source: 'admin-panel',
        version: '1.0'
      },

      // Callbacks (opcionales)
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId'
    });

    // Cleanup si es necesario (el widget no provee destroy nativo)
    return () => {
      // El widget se auto-limpia al desmontar
    };
  }, [mode, target, showWelcomeScreen, allowFileUploads, allowedFilesMimeTypes]);

  return null; // El chat se renderiza automáticamente
}
```

### 6.2 Página de Chat Dedicada

```tsx
// src/pages/Chat.tsx
import { useState } from 'react';
import N8nChat from '../components/N8nChat';

export default function ChatPage() {
  const [chatMode, setChatMode] = useState<'window' | 'fullscreen'>('fullscreen');

  return (
    <div className="page chat-page">
      <div className="page-header">
        <h2>💬 Asistente de Reservas</h2>
        <div className="chat-controls">
          <button 
            className={`btn ${chatMode === 'window' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setChatMode('window')}
          >
            Modo Ventana
          </button>
          <button 
            className={`btn ${chatMode === 'fullscreen' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setChatMode('fullscreen')}
          >
            Pantalla Completa
          </button>
        </div>
      </div>

      <div className="chat-container" id="n8n-chat-container">
        {/* Modo fullscreen requiere un contenedor con altura definida */}
        {chatMode === 'fullscreen' && (
          <N8nChat mode="fullscreen" target="#n8n-chat-container" />
        )}
      </div>

      {/* Modo window se muestra como botón flotante */}
      {chatMode === 'window' && <N8nChat mode="window" />}
    </div>
  );
}
```

### 6.3 Estilos para la Página de Chat

```css
/* src/App.css - Añadir al final */

/* ========================================
   CHAT PAGE STYLES
   ======================================== */

.chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height, 70px));
}

.chat-page .page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
}

.chat-controls {
  display: flex;
  gap: 0.5rem;
}

.chat-container {
  flex: 1;
  position: relative;
  min-height: 500px;
  background: #f5f5f5;
}

/* Estilos para modo fullscreen */
#n8n-chat-container {
  width: 100%;
  height: 100%;
}

/* Override de estilos del widget n8n */
:root {
  --chat--color-primary: #2563eb;
  --chat--color-primary-shade-50: #1d4ed8;
  --chat--color-primary-shade-100: #1e40af;
  --chat--color-secondary: #64748b;
  --chat--color-secondary-shade-50: #475569;
  --chat--color-white: #ffffff;
  --chat--color-light: #f8fafc;
  --chat--color-light-shade-50: #f1f5f9;
  --chat--color-light-shade-100: #e2e8f0;
  --chat--color-medium: #94a3b8;
  --chat--color-dark: #1e293b;
  --chat--color-disabled: #cbd5e1;
  --chat--color-typing: #64748b;

  --chat--border-radius: 0.75rem;
  --chat--transition-duration: 0.2s;

  --chat--window--width: 400px;
  --chat--window--height: 600px;

  --chat--header-height: auto;
  --chat--header--padding: 1rem;
  --chat--header--background: var(--chat--color-primary);
  --chat--header--color: var(--chat--color-white);

  --chat--textarea--height: 50px;
  --chat--message--font-size: 0.95rem;
  --chat--message--padding: 0.75rem 1rem;
  --chat--message--border-radius: var(--chat--border-radius);
  --chat--message-line-height: 1.6;

  --chat--message--bot--background: var(--chat--color-white);
  --chat--message--bot--color: var(--chat--color-dark);
  --chat--message--user--background: var(--chat--color-primary);
  --chat--message--user--color: var(--chat--color-white);

  --chat--toggle--background: var(--chat--color-primary);
  --chat--toggle--hover--background: var(--chat--color-primary-shade-50);
  --chat--toggle--active--background: var(--chat--color-primary-shade-100);
  --chat--toggle--color: var(--chat--color-white);
  --chat--toggle--size: 60px;
}
```

### 6.4 Integrar en el Router

Actualizar `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Mesas from './pages/Mesas';
import Reservas from './pages/Reservas';
import ReservasHoy from './pages/ReservasHoy';
import Semana from './pages/Semana';
import Estadisticas from './pages/Estadisticas';
import Clientes from './pages/Clientes';
import Chat from './pages/Chat';  // ← Nueva página
import './App.css';
import '@n8n/chat/style.css';    // ← Estilos del chat

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mesas" element={<Mesas />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="hoy" element={<ReservasHoy />} />
          <Route path="semana" element={<Semana />} />
          <Route path="estadisticas" element={<Estadisticas />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="chat" element={<Chat />} />  {/* ← Nueva ruta */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 6.5 Añadir al Layout

Actualizar `src/components/Layout.tsx`:

```tsx
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/mesas', label: 'Mesas', icon: '🪑' },
  { path: '/reservas', label: 'Reservas', icon: '📅' },
  { path: '/hoy', label: 'Hoy', icon: '📌' },
  { path: '/semana', label: 'Semana', icon: '📆' },
  { path: '/estadisticas', label: 'Estadísticas', icon: '📈' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/chat', label: 'Chat AI', icon: '💬' },  // ← Nuevo item
];
```

---

## 7. Configuración Avanzada

### 7.1 Opciones Completas de createChat

```typescript
interface ChatOptions {
  // REQUERIDO
  webhookUrl: string;                    // URL del Chat Trigger
  
  // MODO DE VISUALIZACIÓN
  mode?: 'window' | 'fullscreen';        // Tipo de chat
  target?: string;                       // Selector CSS para fullscreen
  
  // MENSAJES INICIALES
  initialMessages?: string[];            // Mensajes al abrir el chat
  showWelcomeScreen?: boolean;           // Mostrar pantalla de bienvenida
  
  // ARCHIVOS
  allowFileUploads?: boolean;            // Permitir subir archivos
  allowedFilesMimeTypes?: string;        // MIME types permitidos
  
  // SESIONES
  loadPreviousSession?: boolean;         // Cargar sesión anterior
  
  // INTERNACIONALIZACIÓN
  defaultLanguage?: string;              // 'en' | 'es' | 'de' | etc.
  i18n?: {
    [lang: string]: {
      title?: string;
      subtitle?: string;
      inputPlaceholder?: string;
      getStarted?: string;
      closeButtonTooltip?: string;
      footer?: string;
    }
  };
  
  // PERSONALIZACIÓN
  metadata?: Record<string, unknown>;    // Datos extra en cada mensaje
  chatInputKey?: string;                 // Key para input (default: 'chatInput')
  chatSessionKey?: string;               // Key para sesión (default: 'sessionId')
  
  // TEMAS
  theme?: {
    // Ver sección de estilos para todas las variables
  };
}
```

### 7.2 Configuración para Producción

```tsx
// src/lib/n8n-chat-config.ts
export const chatConfig = {
  development: {
    webhookUrl: 'http://localhost:5678/webhook/test/chat',
    mode: 'window' as const,
    showWelcomeScreen: true
  },
  production: {
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
    mode: 'window' as const,
    showWelcomeScreen: false
  }
};

export const getChatConfig = () => {
  const env = import.meta.env.MODE;
  return chatConfig[env as keyof typeof chatConfig] || chatConfig.production;
};
```

### 7.3 Metadata Personalizada

Enviar datos adicionales con cada mensaje:

```tsx
createChat({
  webhookUrl: 'https://...',
  metadata: {
    // Identificación
    source: 'admin-panel',
    version: '1.0.0',
    environment: import.meta.env.MODE,
    
    // Usuario (si hay autenticación)
    userId: currentUser?.id,
    userRole: currentUser?.role,
    
    // Contexto del restaurante
    restaurantId: 'la-terraza-mediterranea',
    timezone: 'Europe/Madrid'
  }
});
```

En el workflow de n8n, estos datos estarán disponibles en:
```
{{ $json.metadata.source }}
{{ $json.metadata.userId }}
```

---

## 8. Estilos y Personalización

### 8.1 Variables CSS Completas

```css
/* Añadir en src/App.css o crear src/styles/n8n-chat-theme.css */

:root {
  /* ========================================
     COLORES PRINCIPALES
     ======================================== */
  --chat--color-primary: #2563eb;           /* Azul principal */
  --chat--color-primary-shade-50: #1d4ed8;  /* Hover */
  --chat--color-primary-shade-100: #1e40af; /* Active */
  
  --chat--color-secondary: #64748b;
  --chat--color-secondary-shade-50: #475569;
  
  /* Escala de grises */
  --chat--color-white: #ffffff;
  --chat--color-light: #f8fafc;
  --chat--color-light-shade-50: #f1f5f9;
  --chat--color-light-shade-100: #e2e8f0;
  --chat--color-medium: #94a3b8;
  --chat--color-dark: #1e293b;
  --chat--color-disabled: #cbd5e1;
  --chat--color-typing: #64748b;

  /* ========================================
     LAYOUT Y ESPACIADO
     ======================================== */
  --chat--spacing: 1rem;
  --chat--border-radius: 0.75rem;
  --chat--transition-duration: 0.2s;

  /* Tamaño de ventana (modo window) */
  --chat--window--width: 400px;
  --chat--window--height: 600px;

  /* ========================================
     HEADER
     ======================================== */
  --chat--header-height: auto;
  --chat--header--padding: var(--chat--spacing);
  --chat--header--background: var(--chat--color-primary);
  --chat--header--color: var(--chat--color-white);
  --chat--header--border-top: none;
  --chat--header--border-bottom: none;
  --chat--heading--font-size: 1.25rem;
  --chat--subtitle--font-size: 0.875rem;
  --chat--subtitle--line-height: 1.5;

  /* ========================================
     ÁREA DE MENSAJES
     ======================================== */
  --chat--textarea--height: 50px;
  --chat--message--font-size: 0.95rem;
  --chat--message--padding: var(--chat--spacing);
  --chat--message--border-radius: var(--chat--border-radius);
  --chat--message-line-height: 1.6;

  /* Mensajes del bot */
  --chat--message--bot--background: var(--chat--color-white);
  --chat--message--bot--color: var(--chat--color-dark);
  --chat--message--bot--border: none;

  /* Mensajes del usuario */
  --chat--message--user--background: var(--chat--color-primary);
  --chat--message--user--color: var(--chat--color-white);
  --chat--message--user--border: none;

  /* Código en mensajes */
  --chat--message--pre--background: rgba(0, 0, 0, 0.05);

  /* ========================================
     BOTÓN FLOTANTE (Toggle)
     ======================================== */
  --chat--toggle--background: var(--chat--color-primary);
  --chat--toggle--hover--background: var(--chat--color-primary-shade-50);
  --chat--toggle--active--background: var(--chat--color-primary-shade-100);
  --chat--toggle--color: var(--chat--color-white);
  --chat--toggle--size: 60px;
}

/* ========================================
   TEMA OSCURO (Dark Mode)
   ======================================== */
@media (prefers-color-scheme: dark) {
  :root {
    --chat--color-white: #1e293b;
    --chat--color-light: #0f172a;
    --chat--color-light-shade-50: #1e293b;
    --chat--color-light-shade-100: #334155;
    --chat--color-dark: #f8fafc;
    
    --chat--message--bot--background: #334155;
    --chat--message--bot--color: #f8fafc;
    
    --chat--message--pre--background: rgba(255, 255, 255, 0.1);
  }
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
  :root {
    --chat--window--width: 100%;
    --chat--window--height: 100%;
    --chat--toggle--size: 50px;
  }
}
```

### 8.2 Tema Personalizado para Restaurante

```css
/* Tema "La Terraza Mediterránea" */
:root {
  /* Colores mediterráneos */
  --chat--color-primary: #0077b6;           /* Azul mar */
  --chat--color-primary-shade-50: #0096c7;
  --chat--color-primary-shade-100: #00b4d8;
  
  --chat--color-secondary: #f77f00;         /* Naranja atardecer */
  --chat--color-secondary-shade-50: #d62828;
  
  /* Header con gradiente */
  --chat--header--background: linear-gradient(135deg, #0077b6 0%, #00b4d8 100%);
  
  /* Bordes más suaves */
  --chat--border-radius: 1rem;
  
  /* Mensajes del usuario en naranja */
  --chat--message--user--background: linear-gradient(135deg, #f77f00 0%, #ff9e00 100%);
}
```

---

## 9. Manejo de Sesiones y Memoria

### 9.1 Persistencia de Sesión

El widget @n8n/chat genera automáticamente un `sessionId` único. Para persistirlo:

```tsx
// src/hooks/useChatSession.ts
import { useState, useEffect } from 'react';

const SESSION_KEY = 'n8n_chat_session_id';

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string>(() => {
    // Recuperar sesión existente o crear nueva
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    
    const newId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_KEY, newId);
    return newId;
  });

  const resetSession = () => {
    const newId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_KEY, newId);
    setSessionId(newId);
    // Recargar el chat widget
    window.location.reload();
  };

  return { sessionId, resetSession };
}
```

### 9.2 Configuración de Memory en n8n

En el workflow, configurar Simple Memory:

```json
{
  "parameters": {
    "sessionIdType": "customKey",
    "sessionKey": "={{ $json.sessionId }}",
    "contextWindowLength": 10
  },
  "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
  "typeVersion": 1.3,
  "name": "Simple Memory"
}
```

### 9.3 Cargar Sesión Anterior

En el Chat Trigger, activar **Load Previous Session**:

```json
{
  "parameters": {
    "options": {
      "loadPreviousSession": "fromMemory"
    }
  }
}
```

> ⚠️ Requiere conectar un nodo Memory tanto al Chat Trigger como al AI Agent.

---

## 10. CORS y Seguridad

### 10.1 Configurar CORS en Chat Trigger

```json
{
  "parameters": {
    "options": {
      "allowedOrigins": "http://localhost:5173,http://localhost:3000,https://admin.turestaurante.com"
    }
  }
}
```

| Valor | Uso |
|-------|-----|
| `*` | Permite cualquier origen (desarrollo) |
| `https://dominio.com` | Solo ese dominio |
| Lista separada por comas | Múltiples dominios |

### 10.2 Cabeceras de Seguridad

El widget envía automáticamente:
- `Content-Type: application/json`
- `Origin: https://tu-dominio.com`

### 10.3 Validación en n8n

Añadir un nodo Code al inicio del workflow para validar:

```javascript
// Validar origen
const allowedOrigins = ['https://admin.turestaurante.com', 'http://localhost:5173'];
const origin = $input.first().json.headers?.origin;

if (origin && !allowedOrigins.includes(origin)) {
  throw new Error('Origen no autorizado');
}

// Validar sessionId
const sessionId = $input.first().json.sessionId;
if (!sessionId || typeof sessionId !== 'string') {
  throw new Error('SessionId inválido');
}

return $input.all();
```

### 10.4 Rate Limiting

En n8n Cloud o self-hosted con proxy:

```nginx
# nginx.conf
location /webhook/ {
    limit_req zone=chat_limit burst=5 nodelay;
    proxy_pass http://n8n:5678;
}
```

---

## 11. Streaming de Respuestas

### 11.1 Habilitar Streaming en n8n

1. En el **Chat Trigger**, configurar:
   ```json
   {
     "options": {
       "responseMode": "streaming"
     }
   }
   ```

2. En el **AI Agent** o modelo LLM, activar streaming:
   ```json
   {
     "parameters": {
       "options": {
         "stream": true
       }
     }
   }
   ```

### 11.2 El widget @n8n/chat soporta streaming automáticamente

No se requiere configuración adicional en el frontend. El widget detecta respuestas SSE y las renderiza progresivamente.

### 11.3 Implementación Manual de Streaming

Para UI personalizada:

```tsx
// src/hooks/useStreamingChat.ts
import { useState, useCallback } from 'react';

export function useStreamingChat() {
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessageWithStreaming = useCallback(async (content: string, sessionId: string) => {
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_N8N_WEBHOOK_URL}?action=sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatInput: content, sessionId })
        }
      );

      if (!response.body) throw new Error('No streaming support');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // Parsear SSE
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              setStreamingContent(prev => prev + (parsed.content || ''));
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { streamingContent, isStreaming, sendMessageWithStreaming };
}
```

---

## 12. Solución de Problemas

### 12.1 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `CORS error` | Origen no permitido | Añadir dominio a `allowedOrigins` |
| `404 Not Found` | URL incorrecta o workflow inactivo | Verificar URL y activar workflow |
| `Empty response` | AI Agent no devuelve `output` | Verificar conexiones del Agent |
| `Session not loading` | Memory no conectada | Conectar Memory a Chat Trigger y Agent |
| `Chat not appearing` | CSS no cargado | Importar `@n8n/chat/style.css` |

### 12.2 Debugging

```tsx
// Habilitar logs en desarrollo
createChat({
  webhookUrl: '...',
  // Añadir console.log a los eventos internos
  metadata: {
    debug: true
  }
});

// Verificar en Network tab del navegador:
// 1. Request a webhook URL
// 2. Status 200
// 3. Response body con { output: "..." }
```

### 12.3 Verificar Webhook

```bash
# Test con curl
curl -X POST "https://tu-n8n.com/webhook/WEBHOOK_ID/chat?action=sendMessage" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "chatInput": "Hola, quiero hacer una reserva",
    "sessionId": "test-session-123"
  }'

# Respuesta esperada:
# { "output": "¡Hola! Soy Marina..." }
```

### 12.4 Logs en n8n

1. Ir a **Executions** en n8n
2. Filtrar por workflow del chat
3. Ver input/output de cada nodo
4. Verificar que el AI Agent produce `output`

---

## 13. Checklist de Implementación

### Pre-requisitos

- [ ] n8n 1.79.0+ instalado y funcionando
- [ ] Workflow `Asistente_Reservas_Restaurante_AI_Agent` importado
- [ ] Credenciales configuradas (OpenAI/OpenRouter, Supabase, Telegram)
- [ ] Tablas de Supabase creadas con datos de mesas

### Configuración n8n

- [ ] Chat Trigger configurado con `mode: "webhook"`
- [ ] `public: true` para acceso sin auth
- [ ] `allowedOrigins` configurado con dominios permitidos
- [ ] AI Agent conectado con Model, Memory y Tools
- [ ] Workflow **activado**

### Configuración Frontend

- [ ] `@n8n/chat` instalado: `npm install @n8n/chat`
- [ ] Variables de entorno configuradas en `.env`
- [ ] Estilos importados: `import '@n8n/chat/style.css'`
- [ ] Componente `N8nChat.tsx` creado
- [ ] Página `/chat` añadida al router
- [ ] Navegación actualizada en Layout

### Testing

- [ ] Test con curl al webhook
- [ ] Chat abre correctamente en frontend
- [ ] Mensajes se envían y reciben
- [ ] Memoria de sesión funciona
- [ ] CORS no produce errores
- [ ] Funciona en móvil (responsive)

### Producción

- [ ] URL de webhook de producción configurada
- [ ] CORS limitado a dominios de producción
- [ ] SSL/HTTPS habilitado
- [ ] Rate limiting configurado
- [ ] Logs y monitoring activos

---

## 🎉 Ejemplo Completo: Archivos Finales

### `src/components/N8nChat.tsx`

```tsx
import { useEffect, useRef } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

interface N8nChatProps {
  mode?: 'window' | 'fullscreen';
  target?: string;
}

export default function N8nChat({ mode = 'window', target }: N8nChatProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    createChat({
      webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
      mode,
      target,
      showWelcomeScreen: false,
      initialMessages: [
        '¡Hola! 👋 Soy Marina, tu asistente de reservas.',
        '¿En qué puedo ayudarte?'
      ],
      i18n: {
        es: {
          title: '🍽️ La Terraza Mediterránea',
          subtitle: 'Asistente 24/7',
          inputPlaceholder: 'Escribe tu mensaje...',
          getStarted: 'Nueva conversación',
          footer: ''
        }
      },
      defaultLanguage: 'es'
    });
  }, [mode, target]);

  return null;
}
```

### `src/pages/Chat.tsx`

```tsx
import N8nChat from '../components/N8nChat';

export default function Chat() {
  return (
    <div className="page">
      <div className="page-header">
        <h2>💬 Asistente de Reservas AI</h2>
      </div>
      <div className="chat-fullscreen-container" id="chat-container">
        <N8nChat mode="fullscreen" target="#chat-container" />
      </div>
    </div>
  );
}
```

### `.env` (ejemplo)

```bash
VITE_N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/abc123/chat
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📚 Referencias

- **@n8n/chat npm**: https://www.npmjs.com/package/@n8n/chat
- **n8n Chat Trigger Docs**: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/
- **n8n Advanced AI**: https://docs.n8n.io/advanced-ai/
- **Workflow de ejemplo**: Ver archivo `Asistente_Reservas_Restaurante_AI_Agent.json`

---

*Guía de Integración Chat n8n v1.0 - La Terraza Mediterránea*
