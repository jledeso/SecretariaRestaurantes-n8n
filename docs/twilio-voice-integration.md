# Integración de Twilio Voice con n8n

## Descripción General

Este flujo de trabajo de n8n implementa una integración completa con **Twilio Programmable Voice**, permitiendo:

1. **Recibir llamadas entrantes** y responder con mensajes de voz (TwiML)
2. **Hacer llamadas salientes** programáticas

Basado en la documentación oficial de Twilio: [Server-side quickstart for Programmable Voice](https://www.twilio.com/docs/voice/quickstart/server)

---

## Arquitectura del Flujo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TWILIO VOICE INTEGRATION TEST                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  RAMA 1: Recibir Llamadas Entrantes                                     │
│  ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐   │
│  │ Twilio Voice     │───▶│ Generate TwiML  │───▶│ Respond to       │   │
│  │ Webhook (POST)   │    │ Response        │    │ Twilio           │   │
│  └──────────────────┘    └─────────────────┘    └──────────────────┘   │
│                                                                          │
│  RAMA 2: Hacer Llamadas Salientes                                       │
│  ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐   │
│  │ Manual Trigger   │───▶│ Set Call        │───▶│ Twilio Make      │   │
│  │                  │    │ Parameters      │    │ Call             │   │
│  └──────────────────┘    └─────────────────┘    └──────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Requisitos Previos

### 1. Cuenta de Twilio

1. Crear cuenta en [Twilio Console](https://www.twilio.com/console)
2. Obtener las credenciales:
   - **Account SID**: Identificador de cuenta
   - **Auth Token**: Token de autenticación
3. Comprar o verificar un número de teléfono

### 2. Credenciales en n8n

Crear credenciales de tipo **Twilio API**:

| Campo | Descripción |
|-------|-------------|
| Account SID | Tu Account SID de Twilio Console |
| Auth Token | Tu Auth Token de Twilio Console |

---

## Configuración del Flujo

### Rama 1: Recibir Llamadas Entrantes

#### Nodo: Twilio Voice Webhook

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| HTTP Method | POST | Twilio envía datos por POST |
| Path | `twilio-voice` | Ruta del webhook |
| Response Mode | Using 'Respond to Webhook' Node | Respuesta personalizada |

**URL del Webhook:**
```
https://tu-instancia-n8n.com/webhook/twilio-voice
```

#### Nodo: Generate TwiML Response

Genera una respuesta TwiML (Twilio Markup Language) con texto a voz:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-ES">
    Hola! Gracias por llamar. Este es un mensaje de prueba de integración con Twilio.
    Has llamado desde el número [número del llamante].
  </Say>
  <Pause length="1"/>
  <Say voice="alice" language="es-ES">
    Si deseas más información, por favor visite nuestra página web.
    Hasta pronto!
  </Say>
</Response>
```

**Voces disponibles:**
- `alice` - Voz femenina de alta calidad
- `man` - Voz masculina estándar
- `woman` - Voz femenina estándar

**Idiomas soportados:**
- `es-ES` - Español (España)
- `es-MX` - Español (México)
- `en-US` - Inglés (Estados Unidos)
- [Ver lista completa](https://www.twilio.com/docs/voice/twiml/say#voice)

#### Nodo: Respond to Twilio

| Parámetro | Valor |
|-----------|-------|
| Respond With | Text |
| Response Body | `{{ $json.twiml }}` |
| Content-Type | `text/xml` |
| Response Code | 200 |

---

### Rama 2: Hacer Llamadas Salientes

#### Nodo: Set Call Parameters

Configura los parámetros de la llamada:

| Campo | Valor de Ejemplo | Descripción |
|-------|------------------|-------------|
| toPhone | `+34612345678` | Número destino (formato E.164) |
| fromPhone | `+15551234567` | Tu número Twilio |
| voiceMessage | `Hola, este es...` | Mensaje a reproducir |

#### Nodo: Twilio Make Call

| Parámetro | Valor |
|-----------|-------|
| Resource | Call |
| Operation | Make |
| From | `{{ $json.fromPhone }}` |
| To | `{{ $json.toPhone }}` |
| Message | `{{ $json.voiceMessage }}` |

---

## Configuración en Twilio Console

### Configurar Webhook para Llamadas Entrantes

1. Ir a [Phone Numbers → Active Numbers](https://www.twilio.com/console/phone-numbers/incoming)
2. Seleccionar tu número de teléfono
3. En la sección **Voice Configuration**:
   - **A call comes in**: Webhook
   - **URL**: `https://tu-n8n-url/webhook/twilio-voice`
   - **HTTP Method**: POST
4. Guardar configuración

### Verificar Números para Pruebas

Con cuentas de prueba (trial), solo puedes llamar a números verificados:

1. Ir a [Verified Caller IDs](https://www.twilio.com/console/phone-numbers/verified)
2. Agregar y verificar tu número personal

---

## Elementos TwiML Disponibles

### Verbos Básicos

| Verbo | Descripción | Ejemplo |
|-------|-------------|---------|
| `<Say>` | Texto a voz | `<Say>Hola mundo</Say>` |
| `<Play>` | Reproducir audio | `<Play>https://url/audio.mp3</Play>` |
| `<Pause>` | Pausa en segundos | `<Pause length="2"/>` |
| `<Gather>` | Capturar entrada DTMF | `<Gather numDigits="1">...</Gather>` |
| `<Record>` | Grabar audio | `<Record maxLength="30"/>` |
| `<Dial>` | Transferir llamada | `<Dial>+34612345678</Dial>` |
| `<Hangup>` | Colgar llamada | `<Hangup/>` |
| `<Redirect>` | Redirigir a otro TwiML | `<Redirect>/nuevo-webhook</Redirect>` |

### Ejemplo Avanzado: Menú IVR

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/handle-key" method="POST">
    <Say voice="alice" language="es-ES">
      Bienvenido. Para reservaciones, presione 1.
      Para información, presione 2.
      Para hablar con un agente, presione 0.
    </Say>
  </Gather>
  <Say voice="alice" language="es-ES">
    No se recibió ninguna entrada. Adiós.
  </Say>
</Response>
```

---

## Datos Recibidos del Webhook

Cuando Twilio llama al webhook, envía los siguientes datos en el body:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `CallSid` | ID único de la llamada | `CA1234...` |
| `AccountSid` | Tu Account SID | `AC5678...` |
| `From` | Número del llamante | `+34612345678` |
| `To` | Tu número Twilio | `+15551234567` |
| `CallStatus` | Estado de la llamada | `ringing` |
| `Direction` | Dirección | `inbound` |
| `CallerCity` | Ciudad del llamante | `Madrid` |
| `CallerCountry` | País del llamante | `ES` |

---

## Pruebas

### Probar Webhook Localmente

Para pruebas locales, usar [ngrok](https://ngrok.com/):

```bash
# Instalar ngrok
npm install -g ngrok

# Crear túnel (ajustar puerto según tu n8n)
ngrok http 5678
```

Usar la URL HTTPS de ngrok en Twilio Console.

### Probar Llamada Saliente

1. Verificar tu número personal en Twilio
2. Actualizar `toPhone` con tu número verificado
3. Ejecutar el nodo "Manual Trigger - Make Call"
4. Recibirás la llamada con el mensaje configurado

---

## Solución de Problemas

### Error: "Twilio was unable to fetch content"

- Verificar que el webhook está activo y accesible
- Comprobar que la respuesta es XML válido
- Revisar que el Content-Type es `text/xml`

### Error: "To number is not verified"

- En cuentas trial, solo puedes llamar a números verificados
- Agregar el número en Twilio Console → Verified Caller IDs

### Sin respuesta en la llamada

- Verificar logs de ejecución en n8n
- Comprobar que el webhook responde en menos de 15 segundos
- Revisar formato TwiML

---

## Recursos Adicionales

- [Twilio Voice Documentation](https://www.twilio.com/docs/voice)
- [TwiML Reference](https://www.twilio.com/docs/voice/twiml)
- [n8n Twilio Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.twilio/)
- [Twilio Console](https://www.twilio.com/console)

---

## Archivo del Workflow

El workflow JSON está disponible en: `workflows/twilio-voice-integration-test.json`

Para importar:
1. En n8n, ir a **Workflows** → **Import from File**
2. Seleccionar el archivo JSON
3. Configurar las credenciales de Twilio
4. Actualizar los números de teléfono
5. Activar el workflow
