# Demo: Asistente de turnos para clínicas (odontología / estética)

## Intención
Demo web para **vender** automatizaciones a clínicas privadas. Se muestra en reuniones o se comparte por link. No hay cliente real todavía.

## Objetivo
Que el dueño de una clínica vea en 2 minutos: un bot que responde consultas como una secretaria, agenda turnos solo y manda recordatorios que bajan el ausentismo.

## Qué hace
Página única, dos paneles:
- **Chat paciente (estilo WhatsApp):** IA real (Claude) responde precios, tratamientos, horarios, dirección, obras sociales de una clínica ficticia. Ofrece horarios libres, agenda, reprograma y cancela. Deriva a humano ante consultas médicas o desconocidas.
- **Panel clínica:** agenda semanal que se actualiza en vivo, recordatorios programados (24h / 2h / confirmación), botón "simular día siguiente" que dispara los recordatorios en el chat, métricas demostrativas (consultas respondidas, fuera de horario, ausentismo antes/después).
- **Personalizable:** nombre, logo/color, precios y tratamientos en un único archivo de configuración.

## No-objetivos
WhatsApp real, datos reales de pacientes, login, pagos, base de datos.

## Anti-objetivos
- Que falle o quede trabado en plena reunión.
- Que el bot dé consejos médicos.
- Que se vea genérico/feo.

## Enfoques considerados
- **A. Demo web propia** — elegido. Rápida, controlada, sin dependencias de Meta.
- B. WhatsApp real con n8n — más impacto, pero setup lento y frágil en vivo.
- C. A ahora, B con el primer cliente — es el camino: el "cerebro" (agente + agenda) queda separado de la UI para conectarlo luego a WhatsApp.

## Decisiones técnicas (de Claude)
- Next.js (App Router) + Tailwind, deploy en Vercel.
- AI SDK con Claude vía AI Gateway; tool calling para `ver_disponibilidad`, `agendar_turno`, `reprogramar_turno`, `cancelar_turno`, `derivar_a_humano`.
- Estado de agenda en el cliente (sin DB); el server recibe la agenda actual y devuelve las acciones. Cada visitante tiene su propia demo.
- Config de la clínica en `src/config/clinica.ts`.
- Español rioplatense, mobile-first (en celular: pestañas Chat / Panel).
