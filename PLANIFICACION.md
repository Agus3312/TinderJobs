# Tinder de Trabajo - App para Buscar Trabajo para Programadores

## 📋 Resumen del Proyecto

**Nombre:** Tinder de Trabajo (nombre por definir)
**Tipo:** App móvil (React Native / Flutter) + Backend (Next.js)
**Idea:** Tinder-style job search para programadores con AI auto-apply

---

## 🎯 Propuesta de Valor

- **Core:** Swipe right para aplicar a trabajos automáticamente con AI
- **Diferenciador:** Enfoque en devs (no todos los jobs), matching por stack + seniority
- **Mercado objetivo:** Programadores LATAM, US, EU buscando trabajo remote/híbrido
- **Modelo inicial:** Free para devs, monetizar con empresas después

---

## 🔍 Investigación de Mercado

### Competidores Principales

| Competidor | Diferenciador | Usuarios | Funding |
|-------------|---------------|----------|---------|
| Jobr (2014-2016) | Swipe para jobs | Millones | Adquirido por Monster $12.5M |
| Sorce (YC 2025) | AI aplica automáticamente | 500K | YC + Angels |
| Zagg | Empresas aplican a devs | - | - |
| Hatch (Australia) | AI matching por values | 150K | $7M seed |

### Hallazgos Clave

- El modelo swipe FUNCIONÓ (Jobr exit证明了这一点)
- El dolor de aplicar a 100+ jobs es REAL
- AI apply es el diferenciador actual
- **GAP:**Ningún competidor tiene foco en LATAM

---

## 🏗️ Scope MVP Inicial

### Features Prioritarias

| # | Feature | Prioridad |
|---|---------|-----------|
| 1 | Onboarding + Login (email) | Must |
| 2 | Job Feed con Swipe UI | Must |
| 3 | Job Detail View | Must |
| 4 | AI Apply (auto-apply al website) | Must |
| 5 | Match Notification | Must |
| 6 | Application Tracker | Must |
| 7 | Profile Editor | Should |

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React Native (Expo) |
| Backend | Next.js (API routes) |
| DB | PostgreSQL + Prisma |
| Auth | Email (propio) |
| Job Scraping | Apify / Scrapers propios |
| AI Apply | Playwright + LLM (Groq/Gemini free) |
| Storage | Supabase / AWS S3 |

---

## 🤖 AI Apply - Cómo Funciona

### Flujo

1. Usuario swipea RIGHT → Like job
2. AI Agent:
   - Fetch job URL
   - Parse job description (LLM)
   - Tailor resume + generar cover letter (LLM)
   - Fill form (Playwright)
   - Submit application
3. Actualizar tracker

### Costos (Free Tier)

| Task | Provider | Costo |
|------|----------|-------|
| Cover letter | Groq (Llama 3.3) | $0 |
| Resume tailor | Groq | $0 |
| JD parsing | Gemini 2.5 Flash | $0 |

**Beta (100 usuarios, 20 apps cada uno): $0**

---

## 🎯 Matching - Algoritmo

### Señales de Matching

| Señal | Peso | Descripción |
|-------|------|-------------|
| Stack Match | 35% | Stack del usuario vs job requirements |
| Seniority | 25% | Nivel (intern → principal) |
| Location/Remote | 20% | Remote preference matching |
| Salary | 15% | Salary expectation vs job range |
| Company Vibe | 5% | Startup vs Enterprise |

### Ejemplo

```
USER: React, TypeScript, Mid-level, Remote, $80-120K
JOB: Senior React @ Spotify, Remote, $150-200K
SCORE: 75% (seniority gap pero salary great) - MOSTRAR

JOB: React Startup X, Mid, Remote, $90-110K
SCORE: 95% - EXCELENTE MATCH
```

---

## 📊 Datos a Capturar (Data Moat)

### Datos del Usuario

- Stack tech, seniority, location, salary expectation
- Swipe history (left/right signals)
- Application outcomes

### Datos del Job

- Title, company, description, requirements
- Salary, remote policy, seniority level

### Datos de Interacción

- Swipe events
- Application events
- Match/outcome events

**Meta:** Construir data moat que competidores no pueden copiar

---

## 🗓️ Timeline MVP

| Fase | Duración | Entregable |
|------|----------|------------|
| Setup | 1 semana | Repo, CI/CD, DB, Auth |
| Core UI | 2 semanas | Onboarding, Swipe, Profile |
| Job Ingestion | 2 semanas | Scraper pipeline |
| AI Apply | 2 semanas | Playwright agent |
| Polish | 1 semana | Tracker, notifications |
| **Total** | **~8 semanas** | MVP production ready |

---

## 💰 Revenue Model

| Fase | Modelo |
|------|--------|
| MVP (Beta) | Free para todos |
| Growth | Freemium + B2B empresas |
| Scale | Suscripción empresas (ATS, candidate search) |

---

## ✅ Próximos Pasos

1. [ ] Inicializar proyecto con Next.js + React Native
2. [ ] Setup DB (PostgreSQL)
3. [ ] Implementar auth con email
4. [ ] Job feed con swipe UI
5. [ ] Job scraping pipeline
6. [ ] AI Apply agent
7. [ ] Application tracker
8. [ ] Beta launch

---

## Notas de la Sesión

- Fecha: Mayo 2026
- Modalidad: Beta cerrada con 100-500 usuarios
- AI: Usar Groq + Gemini 2.5 Flash (gratuitos)
- Geo: Global (LATAM, US, EU) desde día 1
- Auth: Solo email inicialmente