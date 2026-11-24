# Recepcionista con IA por WhatsApp: demo para clínicas

Demo de ventas de una **recepcionista virtual con IA** que atiende el WhatsApp de una clínica odontológica o estética. La clínica de ejemplo es ficticia: **Sonrisa Dental & Estética**.

La pantalla tiene dos partes:

- **Chat** (estilo WhatsApp): el paciente pregunta precios, horarios y obras sociales. Pide, cambia o cancela turnos y recibe la confirmación al instante.
- **Panel de la clínica**: lo que ve la recepción. Agenda de los próximos días, recordatorios automáticos (24 h y 2 h antes), derivaciones a una persona y métricas de ejemplo. El botón **"Simular día siguiente"** adelanta el reloj para mostrar cómo salen los recordatorios.

En la computadora los dos paneles se ven lado a lado. En el celular hay dos pestañas abajo, **Chat** y **Clínica**. Cuando el asistente agenda un turno, la pestaña "Clínica" muestra un contador de novedades.

Todo corre en el navegador: los turnos viven en memoria y se reinician al recargar la página. No hay base de datos ni WhatsApp real. Lo único que va al servidor es la conversación con la IA.

## Cómo correrlo

Requisitos: Node.js 20.9 o superior.

```bash
npm install
# creá .env.local con tu clave (ver "Variables de entorno")
npm run dev
```

Abrí <http://localhost:3000>.

Otros comandos:

```bash
npm test        # tests de la lógica de agenda, recordatorios y prompt
npm run build   # build de producción
npm run lint
```

## Variables de entorno

Creá un archivo `.env.local` en la raíz:

```bash
AI_GATEWAY_API_KEY=tu_clave
# Opcional: otro modelo del AI Gateway (por defecto anthropic/claude-sonnet-5.5)
# AI_MODEL=anthropic/claude-sonnet-5.5
```

- **`AI_GATEWAY_API_KEY`** (obligatoria en local). Se saca en el dashboard de Vercel: **AI Gateway → API keys → Create key**.
- **`AI_MODEL`** (opcional). Cualquier modelo disponible en el AI Gateway, con el formato `proveedor/modelo`.

Sin la clave la demo igual abre. El chat muestra el aviso "La demo no está conectada a la IA todavía" y el panel funciona igual.

Deployada en Vercel no hace falta la clave: el AI Gateway se autentica solo con el token OIDC del proyecto (llega como `VERCEL_OIDC_TOKEN` o en el header `x-vercel-oidc-token` de cada request). Igual podés cargarla si preferís. Antes de compartir el link, probá un mensaje en el deploy: si el chat dice "La demo no está conectada a la IA", cargá `AI_GATEWAY_API_KEY` y hacé Redeploy.

Alternativa en local sin crear una clave: con el proyecto ya vinculado a Vercel (`vercel link`), corré `vercel env pull .env.local`. Eso baja un `VERCEL_OIDC_TOKEN` temporal (dura unas horas; si vence, volvé a correr el comando).

## Cómo personalizarla para cada clínica

Todo lo de la clínica está en **`src/config/clinica.ts`**:

| Campo | Para qué |
| --- | --- |
| `nombre` | Nombre en el chat, el panel, el título de la página y el prompt de la IA |
| `colorPrimario` | Color de la marca (hex). Pinta el encabezado del chat y los acentos principales: botones, pestañas, el día de hoy en la agenda y el contador del panel. Los colores de categoría de la agenda (odontología, estética, asistente) son fijos |
| `logoEmoji` | "Foto de perfil" del chat (por ejemplo 🦷, ✨, 💆) |
| `direccion`, `telefono` | Los usa la IA para responder y van en los recordatorios |
| `horario` | Días (`1` = lunes … `6` = sábado), hora de apertura y cierre, y cierre especial de los sábados |
| `tratamientos` | Lista con nombre, precio (en pesos), duración en minutos y descripción. La IA sólo ofrece estos |
| `obrasSociales` | Obras sociales y prepagas que acepta la clínica |

Con cambiar ese archivo alcanza: la IA, la agenda, los recordatorios y los colores se adaptan solos. Los turnos de ejemplo de la agenda se generan en `src/lib/semilla.ts`.

## Deploy en Vercel

1. Subí el repo a GitHub.
2. En Vercel: **Add New → Project** e importá el repo. Next.js se detecta solo; no hay que tocar nada del build.
3. Opcional: en **Settings → Environment Variables** cargá `AI_GATEWAY_API_KEY` (y `AI_MODEL` si querés otro modelo). Sin la clave, el proyecto usa el token OIDC de Vercel para el AI Gateway.
4. **Deploy**. Al terminar tenés un link para abrir desde el celular en la reunión.

Si cambiás variables después del primer deploy, hacé **Redeploy** para que tomen efecto.

### Cuidar el gasto (antes de compartir el link)

El link es público: cualquiera que lo tenga puede chatear, y cada mensaje consume IA. El servidor ya pone topes por request (hasta 40 mensajes de historial, 20.000 caracteres en total, 500 por mensaje del paciente y respuestas cortas de hasta 600 tokens). Además, configurá estas dos cosas en el dashboard de Vercel (no son código):

1. **Límite de gasto del AI Gateway.** En **AI Gateway**, poné un presupuesto o límite de gasto mensual chico (por ejemplo USD 20). Si se alcanza, el chat deja de responder pero no te llega una factura sorpresa.
2. **Rate limit en el Firewall.** En **Firewall → Rules**, agregá una regla para el path `/api/chat` con **Rate Limit** de unas 20 requests por minuto por IP. Una conversación normal usa 1 a 3 requests por mensaje.

## Guión de demo para la reunión

Ideal desde el celular del dueño de la clínica, o en la notebook con los dos paneles a la vista.

1. **Preguntar un precio.** Tocá la sugerencia *"¿Cuánto sale un blanqueamiento?"*. La IA responde con el precio y la duración, y ofrece un turno.
2. **Pedir un turno.** Escribí algo como *"Quiero un turno para limpieza el jueves a la tarde, soy Ana López"*. La IA consulta la agenda, propone horarios y reserva.
3. **Ver la agenda.** Abrí el panel (en el celular, la pestaña **Clínica**, que va a tener un contador). El turno aparece resaltado como ✨ nuevo, con sus recordatorios programados.
4. **Simular el día siguiente.** En el panel tocá **"Simular día siguiente ⏭"**. Sale el recordatorio de 24 h: volvé al chat y está el mensaje *"Hola Ana 👋 te recordamos tu turno…"*.
5. **Contestar "SÍ".** Respondé *SÍ* en el chat. La IA confirma la asistencia. Cerrá con las métricas del panel: menos ausentismo y consultas atendidas fuera de horario.

Extras para mostrar si hay tiempo: pedir reprogramar el turno, preguntar *"¿Atienden OSDE?"* o escribir una urgencia (*"me duele mucho una muela"*) para ver cómo deriva a una persona.
