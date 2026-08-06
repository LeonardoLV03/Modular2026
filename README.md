# 🚑 Modular — Asistente de Primeros Auxilios

Sistema experto de primeros auxilios basado en reglas lógicas (Prolog), con interfaz web moderna. Guía al usuario mediante preguntas para diagnosticar el nivel de gravedad de una emergencia y proporcionar recomendaciones de acción inmediata.

**🌐 Demo en vivo:** [modular2026.vercel.app](https://modular2026.vercel.app)

---

## 📋 Descripción

Implementa un sistema experto de inteligencia artificial (lógica de predicados de primer orden en SWI-Prolog) accesible desde cualquier dispositivo a través de una interfaz web responsiva.

El sistema hace preguntas guiadas al usuario, infiere el caso clínico probable y entrega recomendaciones específicas de primeros auxilios según el nivel de gravedad detectado (leve, moderado o alto).

---

## 🧠 Módulos de Emergencia

| Módulo | Descripción |
|--------|-------------|
| 🫀 Desmayo | Pérdida de consciencia |
| 🩸 Hemorragia | Sangrado abundante |
| 💨 Asfixia | Dificultad respiratoria |
| 🔥 Quemadura | Daño por calor |
| 🦴 Fractura | Hueso roto o lesionado |
| ⚗️ Intoxicación | Veneno o sustancia tóxica |
| 🐛 Picadura | Mordedura o picadura de animal |
| ⚡ Descarga Eléctrica | Choque eléctrico o rayo |
| ☀️ Insolación | Golpe de calor solar |
| 🧠 Convulsión | Episodio convulsivo |

---

## 🏗️ Arquitectura del Sistema
```
Usuario (navegador)
│
▼
┌─────────────────────────┐
│   Vercel (Frontend)     │
│   React + Vite + TS     │
│   modular2026.vercel.app│
└──────────┬──────────────┘
│ HTTP/REST
┌─────┴──────────┐
│                │
▼                ▼
┌──────────────┐  ┌──────────────────┐
│   Railway    │  │    Railway       │
│   Backend    │  │   Stats API      │
│   SWI-Prolog │  │   Node.js +      │
│   + Docker   │  │   Express        │
└──────────────┘  └────────┬─────────┘
│
▼
┌─────────────────┐
│  MongoDB Atlas  │
│  (Nube, NoSQL)  │
└─────────────────┘
```
El sistema está completamente distribuido — cliente y servidor corren en equipos físicamente distintos, comunicándose por protocolo HTTP/REST sobre internet.

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **TypeScript** — interfaz de usuario
- **Vite** — bundler y servidor de desarrollo
- **Tailwind CSS v4** — estilos utilitarios
- **Framer Motion** — animaciones
- **Lucide React** — iconografía

### Backend Prolog
- **SWI-Prolog** — motor de inferencia (sistema experto)
- **library(http/thread_httpd)** — servidor HTTP nativo
- **Docker** — contenedorización para despliegue

### Stats API
- **Node.js** + **Express** — API REST de estadísticas
- **MongoDB Atlas** — base de datos NoSQL en la nube
- **Docker** — contenedorización

### Infraestructura
- **GitHub** — control de versiones
- **Vercel** — hosting del frontend (CDN global)
- **Railway** — hosting del backend Prolog y Stats API

---

## 📁 Estructura del Proyecto
```
Modular/
├── backend/                  # Backend SWI-Prolog
│   ├── Dockerfile
│   ├── .dockerignore
│   └── server.pl             # Sistema experto + API HTTP
│
├── stats-api/                # API de estadísticas
│   ├── Dockerfile
│   ├── package.json
│   └── server.js             # API REST + conexión MongoDB
│
├── src/                      # Frontend React
│   ├── app/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx   # Interfaz de chat
│   │   │   ├── DiagnosisCard.tsx   # Tarjeta de diagnóstico
│   │   │   ├── Sidebar.tsx         # Menú lateral
│   │   │   ├── StatsPanel.tsx      # Panel de estadísticas
│   │   │   ├── WelcomePanel.tsx    # Pantalla de bienvenida
│   │   │   └── EmergencyAlert.tsx  # Alerta de emergencia
│   │   ├── services/
│   │   │   ├── prologApi.ts        # Cliente API Prolog
│   │   │   └── statsApi.ts         # Cliente API estadísticas
│   │   └── App.tsx
│   └── styles/
│
├── .env.example              # Variables de entorno de ejemplo
├── vercel.json               # Configuración Vercel
└── index.html
```
---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz con:

env
VITE_API_URL=http://localhost:5000       # URL del backend Prolog
VITE_STATS_URL=http://localhost:3001     # URL de la Stats API

## Para instalar:

### 1. Clonar/Descargar el proyecto

git clone https://github.com/LeonardoLV03/Modular2026.git
cd Modular2026

### 2. Instalar dependencias

```bash
cd backend
swipl server.pl
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con la URL de tu backend Prolog:

```
VITE_PROLOG_API_URL=http://localhost:5000/api
```

### 4. Iniciar las stats API

```bash
cd stats-api
npm install
node server.js
```
### 5. Iniciar el frontend

```bash
cd ..
npm run dev
```
