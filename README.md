# Chatbot de Primeros Auxilios 

Sistema de diagnóstico de primeros auxilios con interfaz visual tipo botiquín, conectado a backend Prolog.

## Estructura del Proyecto

```
src/
├── app/
│   ├── App.tsx                          # Componente principal
│   ├── components/
│   │   ├── FirstAidKit.tsx             # Pantalla del botiquín
│   │   ├── ChatInterface.tsx           # Interfaz de chat
│   │   ├── ChatMessage.tsx             # Burbujas de mensaje
│   │   ├── DiagnosisCard.tsx           # Tarjeta de recomendaciones
│   │   └── EmergencyAlert.tsx          # Alerta de emergencia
│   └── services/
│       └── prologApi.ts                 # Servicio de conexión con Prolog
├── styles/
│   ├── theme.css                        # Tokens de diseño
│   └── fonts.css                        # Fuentes
├── package.json                         # Dependencias
├── .env.example                         # Variables de entorno
└── PROLOG_BACKEND.md                    # Documentación del backend
```

## Para instalar:

### 1. Clonar/Descargar el proyecto

Desde github, ten tu carpeta local donde descargaras el proyecto, dentro de ella en CMD utilizaras git clone https://github.com/Katiaavalos236/Health_Care_Aid.git

### 2. Instalar dependencias

```bash
pnpm install
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

### 4. Iniciar el servidor de desarrollo

```bash
pnpm run dev
```

## Backend Prolog

El frontend ya está listo para conectarse con un backend Prolog. 

1. Guarda el código Prolog en `server.pl`
2. Ejecuta: `swipl server.pl`
3. El servidor estará en `http://localhost:5000`
4. Configura React para apuntar a esta URL (archivo `.env`)

Si se utiliza dentro de Prolog, solo se necesita consultar el archivo `server.pl`, después se utiliza `main.` para que el servidor este arriba.

### Endpoints requeridos:

- `POST /api/start-consultation` - Iniciar sesión
- `POST /api/next-question` - Obtener siguiente pregunta
- `POST /api/diagnosis` - Obtener diagnóstico final
- `POST /api/end-consultation` - Finalizar sesión

## Tecnologías

- **React 18.3** - Framework UI
- **TypeScript** - Lenguaje tipado
- **Tailwind CSS v4** - Estilos
- **Motion (Framer Motion)** - Animaciones
- **Lucide React** - Iconos
- **Vite** - Build tool
- **Prolog (SWI-Prolog)** - Backend de lógica médica

## Flujo de Usuario

1. **Pantalla inicial**: Usuario ve botiquín con 4 módulos
2. **Selección**: Elige tipo de emergencia (desmayo, hemorragia, etc.)
3. **Chat**: Sistema hace preguntas específicas
4. **Respuestas**: Usuario responde (Sí/No/No estoy seguro)
5. **Diagnóstico**: 
   - Si es emergencia → Alerta 911
   - Si no es emergencia → Recomendaciones
6. **Nueva consulta**: Botón para volver al inicio

## En modo de Desarrollo

El proyecto incluye:

- **Hot reload** - Cambios instantáneos
- **TypeScript** - Errores en tiempo de desarrollo
- **Tailwind JIT** - Estilos compilados al vuelo
- **React DevTools** - Compatible

## Si NO hay conexión con el servidor en Prolog:

Si el backend Prolog no está disponible, la app mostrará:
```
"No se pudo conectar con el servidor. Usando modo offline."
```

## Licencia

Proyecto educativo de sistema experto de primeros auxilios.

---

**Creado con React + TypeScript + Tailwind + Prolog**
