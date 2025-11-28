/**
 * Configuración del chat de n8n para diferentes entornos.
 * 
 * Este archivo centraliza la configuración del widget de chat
 * para facilitar su mantenimiento y personalización.
 */

export interface ChatConfig {
  webhookUrl: string;
  mode: 'window' | 'fullscreen';
  showWelcomeScreen: boolean;
  allowFileUploads: boolean;
  defaultLanguage: string;
}

export interface ChatTheme {
  primaryColor: string;
  primaryShade50: string;
  primaryShade100: string;
  headerBackground: string;
  headerColor: string;
  borderRadius: string;
  windowWidth: string;
  windowHeight: string;
}

/**
 * Configuración por entorno
 */
const configs: Record<string, ChatConfig> = {
  development: {
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/test/chat',
    mode: 'window',
    showWelcomeScreen: true,
    allowFileUploads: false,
    defaultLanguage: 'es'
  },
  production: {
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
    mode: 'window',
    showWelcomeScreen: false,
    allowFileUploads: false,
    defaultLanguage: 'es'
  }
};

/**
 * Tema visual del chat
 */
export const chatTheme: ChatTheme = {
  primaryColor: '#2563eb',
  primaryShade50: '#1d4ed8',
  primaryShade100: '#1e40af',
  headerBackground: '#2563eb',
  headerColor: '#ffffff',
  borderRadius: '0.75rem',
  windowWidth: '400px',
  windowHeight: '600px'
};

/**
 * Mensajes iniciales del chat
 */
export const initialMessages = [
  '¡Hola! 👋 Soy Marina, tu asistente de reservas de La Terraza Mediterránea.',
  '¿En qué puedo ayudarte hoy?\n\n• Hacer una reserva\n• Consultar disponibilidad\n• Cancelar o modificar reserva\n• Información del restaurante'
];

/**
 * Traducciones del chat
 */
export const i18n = {
  es: {
    title: '🍽️ La Terraza Mediterránea',
    subtitle: 'Asistente de reservas 24/7',
    inputPlaceholder: 'Escribe tu mensaje aquí...',
    getStarted: 'Nueva conversación',
    closeButtonTooltip: 'Cerrar chat',
    footer: ''
  },
  en: {
    title: '🍽️ La Terraza Mediterránea',
    subtitle: 'Reservation assistant 24/7',
    inputPlaceholder: 'Type your message here...',
    getStarted: 'New conversation',
    closeButtonTooltip: 'Close chat',
    footer: ''
  }
};

/**
 * Obtiene la configuración según el entorno actual
 */
export function getChatConfig(): ChatConfig {
  const env = import.meta.env.MODE;
  return configs[env] || configs.production;
}

/**
 * Verifica si el chat está correctamente configurado
 */
export function isChatConfigured(): boolean {
  const config = getChatConfig();
  return !!config.webhookUrl && config.webhookUrl.includes('webhook');
}

/**
 * Genera un ID de sesión único
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtiene o crea un ID de sesión persistente
 */
export function getOrCreateSessionId(): string {
  const SESSION_KEY = 'n8n-chat-session-id';
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Limpia la sesión actual
 */
export function clearSession(): void {
  localStorage.removeItem('n8n-chat-session-id');
}

/**
 * Metadatos enviados con cada mensaje
 */
export function getChatMetadata(): Record<string, unknown> {
  return {
    source: 'admin-panel',
    version: '1.0',
    environment: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateSessionId()
  };
}
