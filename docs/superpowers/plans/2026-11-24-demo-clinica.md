# Demo Clínica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Demo web de un asistente IA que responde consultas, agenda turnos y manda recordatorios para una clínica odontológica/estética ficticia.

**Architecture:** Next.js App Router. Toda la agenda vive en el cliente (React state) y se manipula con funciones puras de `src/lib/agenda.ts`. `/api/chat` usa AI SDK `streamText` con tools **sin `execute`**: el cliente las ejecuta en `onToolCall` contra la agenda local y devuelve el resultado con `addToolResult`. Así cada visitante tiene su propia demo y no hay DB.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, TypeScript, AI SDK v6 (`ai`, `@ai-sdk/react`) vía Vercel AI Gateway con modelo `anthropic/claude-sonnet-4.5` (o el Sonnet más nuevo disponible en el gateway), zod, vitest.

**Spec:** `docs/superpowers/specs/2026-11-24-demo-clinica-design.md`

## Global Constraints
- Todo el texto visible en español rioplatense ("vos", "querés").
- Clínica ficticia: "Sonrisa Dental & Estética". Nunca datos reales de pacientes.
- Mobile-first: <768px muestra pestañas "Chat" / "Clínica"; ≥768px dos paneles lado a lado. Sin scroll horizontal.
- Toda la config de la clínica en `src/config/clinica.ts` (único lugar a editar para personalizar).
- Sin DB, sin login, sin WhatsApp real.
- El bot nunca da diagnóstico ni consejo médico: usa `derivar_a_humano`.
- Fechas: la demo usa un "ahora" virtual (estado), no `Date.now()` directo, para poder simular el día siguiente.
- Turnos sólo dentro del horario de atención, en el futuro respecto del "ahora" virtual, sin superposición.

## Review Focus
1. Falta `AI_GATEWAY_API_KEY` → el chat muestra un mensaje amable ("La demo no está conectada a la IA todavía"), no un stack trace. (Task 3)
2. Paciente pide horario ocupado, pasado o fuera de horario → la tool devuelve error y el bot ofrece alternativas. (Task 1 tests)
3. Consulta médica ("me sangra la encía, ¿es grave?") → `derivar_a_humano`. (Task 2 test sobre prompt)
4. Mensajes muy largos o spam de envíos mientras responde → input deshabilitado mientras `status !== 'ready'`, máx 500 caracteres. (Task 4)
5. Pantalla 360px de ancho → sin overflow horizontal. (Task 6 verificación Playwright)

---

### Task 1: Scaffold + config + lógica de agenda

**Files:**
- Create: proyecto Next.js en la raíz (`npx create-next-app@latest . --ts --tailwind --app --src-dir --eslint --use-npm --yes --import-alias "@/*"`), + `vitest`, `zod`, `ai`, `@ai-sdk/react`.
- Create: `src/config/clinica.ts`, `src/lib/agenda.ts`, `src/lib/semilla.ts`
- Test: `src/lib/agenda.test.ts`

**Interfaces (Produces):**
```ts
// src/config/clinica.ts
export type Tratamiento = { id: string; nombre: string; precio: number; duracionMin: number; descripcion: string };
export type ClinicaConfig = {
  nombre: string; colorPrimario: string; logoEmoji: string; direccion: string; telefono: string;
  horario: { dias: number[]; desde: string; hasta: string }; // dias: 1=lun..6=sab; "09:00"
  tratamientos: Tratamiento[]; obrasSociales: string[];
};
export const clinica: ClinicaConfig;
// ~8 tratamientos: consulta/evaluación, limpieza, blanqueamiento, ortodoncia invisible (evaluación), implante (evaluación), botox, ácido hialurónico, limpieza facial. Precios en ARS. Lun-vie 09:00-19:00, sáb 09:00-13:00.

// src/lib/agenda.ts
export type EstadoTurno = 'confirmado' | 'pendiente' | 'cancelado';
export type Turno = { id: string; paciente: string; tratamientoId: string; inicio: string /* ISO */; estado: EstadoTurno; origen: 'bot' | 'semilla' };
export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };
export function slotsLibres(turnos: Turno[], cfg: ClinicaConfig, ahora: Date, tratamientoId: string, dias?: number /* default 5 */): string[]; // ISO, paso 30 min, máx 6 resultados
export function agendar(turnos: Turno[], cfg: ClinicaConfig, ahora: Date, d: { paciente: string; tratamientoId: string; inicio: string }): Resultado<{ turnos: Turno[]; turno: Turno }>;
export function reprogramar(turnos: Turno[], cfg: ClinicaConfig, ahora: Date, id: string, nuevoInicio: string): Resultado<{ turnos: Turno[]; turno: Turno }>;
export function cancelar(turnos: Turno[], id: string): Resultado<{ turnos: Turno[] }>;
export type Recordatorio = { turnoId: string; tipo: '24h' | '2h'; enviarEn: string; texto: string; enviado: boolean };
export function recordatoriosPara(turnos: Turno[], cfg: ClinicaConfig, ahora: Date): Recordatorio[]; // 24h y 2h antes, enviado = enviarEn <= ahora

// src/lib/semilla.ts
export function turnosSemilla(ahora: Date): Turno[]; // ~10 turnos en los próximos 5 días hábiles, origen 'semilla'
```

- [ ] **Step 1: Scaffold** y agregar `"test": "vitest run"` a package.json. Run `npm run build` → éxito.
- [ ] **Step 2: Tests fallando** en `agenda.test.ts` con `ahora = new Date('2026-11-24T10:00:00-03:00')` (martes):
  - `slotsLibres` no devuelve horarios pasados, ni fuera de horario, ni domingos, ni que se superpongan con un turno existente (considerando `duracionMin`).
  - `agendar` ok agrega turno `estado:'confirmado', origen:'bot'`; error `"Ese horario ya está ocupado"` si superpone; error `"Fuera del horario de atención"`; error `"Ese horario ya pasó"`; error `"Tratamiento inexistente"`.
  - `reprogramar` mueve el turno y valida igual que `agendar` (ignorando el propio turno); `cancelar` pone `estado:'cancelado'` y libera el slot; id inexistente → `"Turno no encontrado"`.
  - `recordatoriosPara` genera 2 por turno no cancelado; `enviado` según `ahora`.
- [ ] **Step 3:** `npm test` → FAIL.
- [ ] **Step 4:** Implementar config, agenda (funciones puras, sin mutar inputs) y semilla.
- [ ] **Step 5:** `npm test` → PASS. Commit `feat: config de clínica y lógica de agenda`.

### Task 2: Prompt del sistema

**Files:** Create `src/lib/prompt.ts`; Test `src/lib/prompt.test.ts`

**Interfaces:** Produces `export function construirPrompt(cfg: ClinicaConfig, ahora: Date): string`

- [ ] **Step 1: Test:** el prompt contiene nombre de la clínica, cada tratamiento con su precio formateado (`$ 45.000`), dirección, horario, obras sociales, la fecha virtual en texto ("martes 24 de noviembre"), y las frases literales `"Nunca des diagnósticos ni consejos médicos"` y `"usá la herramienta derivar_a_humano"`.
- [ ] **Step 2:** FAIL → implementar (rol: secretaria cálida, respuestas cortas tipo WhatsApp, emojis con moderación, siempre ofrecer 2-3 horarios usando `ver_disponibilidad` antes de agendar, pedir nombre antes de agendar, confirmar resumen al final) → PASS. Commit.

### Task 3: API de chat

**Files:** Create `src/app/api/chat/route.ts`, `src/lib/tools.ts`

**Interfaces (Produces):**
```ts
// src/lib/tools.ts — sin execute (se ejecutan en el cliente)
export const tools: {
  ver_disponibilidad: Tool<{ tratamientoId: string }>;
  agendar_turno: Tool<{ paciente: string; tratamientoId: string; inicio: string }>;
  reprogramar_turno: Tool<{ turnoId: string; nuevoInicio: string }>;
  cancelar_turno: Tool<{ turnoId: string }>;
  ver_mis_turnos: Tool<{ paciente: string }>;
  derivar_a_humano: Tool<{ motivo: string }>;
};
// route.ts: POST { messages: UIMessage[], ahora: string } → streamText({ model: 'anthropic/claude-sonnet-4.5', system: construirPrompt(clinica, new Date(ahora)), messages: convertToModelMessages(messages), tools, stopWhen: stepCountIs(5) }).toUIMessageStreamResponse()
```
- [ ] **Step 1:** Implementar. Si falta `AI_GATEWAY_API_KEY` y no hay `VERCEL_OIDC_TOKEN`, responder 503 `{ error: 'sin_ia' }`.
- [ ] **Step 2:** Verificar: `npm run build` ok; `curl -X POST localhost:3000/api/chat` sin key → 503 con `sin_ia`. Commit.

### Task 4: Chat estilo WhatsApp

**Files:** Create `src/components/Chat.tsx`, `src/components/Demo.tsx` (dueño del estado); Modify `src/app/page.tsx`, `src/app/layout.tsx` (título, lang="es", metadata).

**Interfaces:**
- `Demo` mantiene `turnos: Turno[]`, `ahora: Date`, `derivaciones: string[]`, `mensajesSistema` (recordatorios inyectados).
- `useChat({ transport: new DefaultChatTransport({ api: '/api/chat', body: () => ({ ahora: ahora.toISOString() }) }), sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls, onToolCall })` — `onToolCall` mapea cada tool a la función de `agenda.ts`, actualiza `turnos` y llama `addToolResult` con el `valor` o `{ error }`.
- [ ] **Step 1:** UI: header verde con logo/nombre "en línea", burbujas (paciente derecha verde claro, bot izquierda blanca), hora en cada burbuja, indicador "escribiendo…", 3 chips de sugerencia iniciales ("¿Cuánto sale un blanqueamiento?", "Quiero un turno para limpieza", "¿Atienden OSDE?"), input máx 500 chars deshabilitado mientras responde, mensaje amable si la API devuelve `sin_ia`.
- [ ] **Step 2:** Verificar con `npm run dev` + Playwright: carga, se ven chips, enviar sin key muestra el aviso amable. Commit.

### Task 5: Panel de la clínica

**Files:** Create `src/components/panel/Agenda.tsx`, `Recordatorios.tsx`, `Metricas.tsx`, `PanelClinica.tsx`; Modify `Demo.tsx`.

- [ ] **Step 1:** Agenda: 5 días hábiles desde `ahora`, columnas por día, turnos como bloques con tratamiento y paciente; los de `origen:'bot'` resaltados con animación "✨ nuevo"; cancelados tachados.
- [ ] **Step 2:** Recordatorios: lista de `recordatoriosPara()` con ✔ enviado / ⏳ programado. Lista de derivaciones a humano.
- [ ] **Step 3:** Botón "Simular día siguiente ⏭": `ahora += 1 día` (a las 09:00); por cada recordatorio que pasa a `enviado` y pertenece a un turno `origen:'bot'`, inyectar en el chat burbuja del bot con el texto ("Hola Ana 👋 te recordamos tu turno de Limpieza mañana 16:30. Respondé SÍ para confirmar").
- [ ] **Step 4:** Métricas demostrativas (constantes, rotuladas "datos de ejemplo"): 142 consultas respondidas, 38 fuera de horario, ausentismo 22% → 6%, "$ 1.240.000 recuperados/mes"; + contador en vivo de turnos agendados por el bot en esta sesión.
- [ ] **Step 5:** Verificar con Playwright. Commit.

### Task 6: Layout responsive, pulido y verificación final

**Files:** Modify `Demo.tsx`, `globals.css`; Create `README.md` (cómo correr, cómo personalizar `clinica.ts`, variable `AI_GATEWAY_API_KEY`, deploy en Vercel).
- [ ] **Step 1:** Tabs en mobile, dos paneles en desktop, color primario desde config.
- [ ] **Step 2:** Playwright: screenshots a 360px y 1280px; `document.documentElement.scrollWidth <= innerWidth`.
- [ ] **Step 3:** `npm test && npm run build && npm run lint` → todo ok. Si hay key disponible, prueba punta a punta: pedir turno de limpieza → aparece en agenda → simular día → llega recordatorio.
- [ ] **Step 4:** Commit y push.
