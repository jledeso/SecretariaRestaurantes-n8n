import { useState, useEffect } from 'react';
import N8nChat from '../components/N8nChat';

type ChatMode = 'window' | 'fullscreen';

/**
 * Página dedicada al chat con el asistente AI de reservas.
 * Permite cambiar entre modo ventana flotante y pantalla completa.
 */
export default function Chat() {
  const [chatMode, setChatMode] = useState<ChatMode>('fullscreen');
  const [chatKey, setChatKey] = useState(0);
  const [webhookConfigured, setWebhookConfigured] = useState(false);

  useEffect(() => {
    // Verificar si la URL del webhook está configurada
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
    setWebhookConfigured(!!webhookUrl);
  }, []);

  const handleModeChange = (newMode: ChatMode) => {
    if (newMode !== chatMode) {
      setChatMode(newMode);
      // Forzar re-renderizado del chat al cambiar modo
      setChatKey(prev => prev + 1);
    }
  };

  const handleResetChat = () => {
    // Limpiar sessionId del localStorage y recargar
    localStorage.removeItem('n8n-chat-session');
    window.location.reload();
  };

  if (!webhookConfigured) {
    return (
      <div className="page">
        <div className="page-header">
          <h2>💬 Asistente de Reservas AI</h2>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Configuración Pendiente</h3>
          <p>El chat no está configurado correctamente.</p>
          <div className="error-details">
            <p>Añade la siguiente variable al archivo <code>.env</code>:</p>
            <pre>VITE_N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/WEBHOOK_ID/chat</pre>
            <p>Luego reinicia el servidor de desarrollo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page chat-page">
      <div className="page-header">
        <h2>💬 Asistente de Reservas AI</h2>
        <div className="chat-controls">
          <button
            className={`btn ${chatMode === 'fullscreen' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleModeChange('fullscreen')}
          >
            📺 Pantalla Completa
          </button>
          <button
            className={`btn ${chatMode === 'window' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleModeChange('window')}
          >
            🪟 Ventana Flotante
          </button>
          <button
            className="btn btn-outline"
            onClick={handleResetChat}
            title="Iniciar nueva conversación"
          >
            🔄 Nueva Conversación
          </button>
        </div>
      </div>

      <div className="chat-info">
        <p>
          <strong>Marina</strong> es tu asistente virtual de reservas. Puede ayudarte con:
        </p>
        <ul>
          <li>📅 Consultar disponibilidad de mesas</li>
          <li>✅ Crear nuevas reservas</li>
          <li>🔍 Buscar reservas existentes</li>
          <li>❌ Cancelar o modificar reservas</li>
          <li>🪑 Solicitar tronas o alzadores</li>
          <li>ℹ️ Información del restaurante</li>
        </ul>
      </div>

      {chatMode === 'fullscreen' && (
        <div className="chat-fullscreen-container" id="n8n-chat-container">
          <N8nChat key={chatKey} mode="fullscreen" target="#n8n-chat-container" />
        </div>
      )}

      {chatMode === 'window' && (
        <>
          <div className="chat-window-placeholder">
            <p>El chat aparece como un botón flotante en la esquina inferior derecha.</p>
            <p>Haz clic en el icono 💬 para abrir la conversación.</p>
          </div>
          <N8nChat key={chatKey} mode="window" />
        </>
      )}
    </div>
  );
}
