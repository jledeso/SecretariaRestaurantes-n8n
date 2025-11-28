/**
 * Declaraciones de tipos para @n8n/chat
 * 
 * Este archivo proporciona tipos TypeScript para el paquete @n8n/chat
 * hasta que el paquete proporcione sus propios tipos o se instale.
 */

declare module '@n8n/chat' {
  export interface ChatI18n {
    title?: string;
    subtitle?: string;
    inputPlaceholder?: string;
    getStarted?: string;
    closeButtonTooltip?: string;
    footer?: string;
  }

  export interface ChatOptions {
    /** URL del webhook del Chat Trigger de n8n */
    webhookUrl: string;
    
    /** Modo de visualización: 'window' (flotante) o 'fullscreen' */
    mode?: 'window' | 'fullscreen';
    
    /** Selector CSS del contenedor para modo fullscreen */
    target?: string;
    
    /** Mensajes iniciales mostrados al abrir el chat */
    initialMessages?: string[];
    
    /** Mostrar pantalla de bienvenida */
    showWelcomeScreen?: boolean;
    
    /** Permitir subir archivos */
    allowFileUploads?: boolean;
    
    /** MIME types permitidos para archivos */
    allowedFilesMimeTypes?: string;
    
    /** Cargar sesión anterior */
    loadPreviousSession?: boolean;
    
    /** Traducciones por idioma */
    i18n?: Record<string, ChatI18n>;
    
    /** Idioma por defecto */
    defaultLanguage?: string;
    
    /** Metadatos enviados con cada mensaje */
    metadata?: Record<string, unknown>;
    
    /** Key para el input del chat (default: 'chatInput') */
    chatInputKey?: string;
    
    /** Key para el session ID (default: 'sessionId') */
    chatSessionKey?: string;
    
    /** Configuración del tema visual */
    theme?: Record<string, string>;
  }

  /**
   * Crea e inicializa el widget de chat de n8n
   * @param options - Opciones de configuración del chat
   */
  export function createChat(options: ChatOptions): void;
}

declare module '@n8n/chat/style.css' {
  const styles: string;
  export default styles;
}
