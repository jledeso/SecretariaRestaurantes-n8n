import { useEffect, useRef } from 'react';
import { createChat } from '@n8n/chat';

interface N8nChatProps {
  /** Modo de visualización del chat */
  mode?: 'window' | 'fullscreen';
  /** Selector CSS del contenedor (solo para fullscreen) */
  target?: string;
  /** Mostrar pantalla de bienvenida */
  showWelcomeScreen?: boolean;
  /** Permitir subir archivos */
  allowFileUploads?: boolean;
  /** MIME types permitidos para archivos */
  allowedFilesMimeTypes?: string;
}

/**
 * Componente que integra el chat de n8n en la aplicación React.
 * 
 * @example
 * // Modo ventana flotante
 * <N8nChat mode="window" />
 * 
 * @example
 * // Modo pantalla completa
 * <div id="chat-container" style={{ height: '500px' }}>
 *   <N8nChat mode="fullscreen" target="#chat-container" />
 * </div>
 */
export default function N8nChat({
  mode = 'window',
  target,
  showWelcomeScreen = false,
  allowFileUploads = false,
  allowedFilesMimeTypes
}: N8nChatProps) {
  const chatInitialized = useRef(false);

  useEffect(() => {
    // Evitar inicialización múltiple
    if (chatInitialized.current) return;
    chatInitialized.current = true;

    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error(
        '[N8nChat] Error: VITE_N8N_WEBHOOK_URL no está configurada.\n' +
        'Añade la URL del webhook en el archivo .env:\n' +
        'VITE_N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/WEBHOOK_ID/chat'
      );
      return;
    }

    try {
      createChat({
        webhookUrl,
        mode,
        target,
        showWelcomeScreen,
        allowFileUploads,
        allowedFilesMimeTypes,

        // Mensajes iniciales
        initialMessages: [
          '¡Hola! 👋 Soy Marina, tu asistente de reservas de La Terraza Mediterránea.',
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
          version: '1.0',
          environment: import.meta.env.MODE
        },

        // Keys para los datos del chat
        chatInputKey: 'chatInput',
        chatSessionKey: 'sessionId'
      });

      console.log('[N8nChat] Chat inicializado correctamente');
    } catch (error) {
      console.error('[N8nChat] Error al inicializar el chat:', error);
    }
  }, [mode, target, showWelcomeScreen, allowFileUploads, allowedFilesMimeTypes]);

  // El componente no renderiza nada visible directamente
  // El widget se monta automáticamente en el DOM
  return null;
}
