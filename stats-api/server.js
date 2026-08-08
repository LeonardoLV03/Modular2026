require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://localhost',        // ← Capacitor Android (androidScheme: 'https')
  'capacitor://localhost',    // ← por si algún dispositivo usa este esquema
  process.env.FRONTEND_URL,
].filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')));
}

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    callback(new Error('CORS no permitido'));
  }
}));

// ── Socket.io ─────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true);
      callback(new Error('CORS no permitido'));
    },
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// ── Seguridad ────────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: 'Demasiadas peticiones. Intenta en 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const saveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: 'Límite de guardado alcanzado. Intenta más tarde.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de login. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// ── Autenticación ────────────────────────────────────────────
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

// ── Validación ───────────────────────────────────────────────
const VALID_MODULES = [
  'desmayo', 'hemorragia', 'asfixia', 'quemadura',
  'fractura', 'intoxicacion', 'picadura', 'descarga',
  'insolacion', 'convulsion'
];

const VALID_SEVERITIES = ['high', 'medium', 'low'];

function validateConsultation(data) {
  const errors = [];
  if (!data.module || !VALID_MODULES.includes(data.module))
    errors.push('Módulo inválido');
  if (!data.severity || !VALID_SEVERITIES.includes(data.severity))
    errors.push('Severidad inválida');
  if (typeof data.isEmergency !== 'boolean')
    errors.push('isEmergency debe ser booleano');
  if (!Array.isArray(data.answers) || data.answers.length > 10)
    errors.push('Respuestas inválidas (máx 10)');
  if (!Array.isArray(data.recommendations) || data.recommendations.length > 20)
    errors.push('Recomendaciones inválidas (máx 20)');
  return errors;
}

// ── Helpers de estadísticas ──────────────────────────────────
async function buildStats(collection) {
  const consultations = await collection.find({}).toArray();
  const total = consultations.length;

  const byModule = {};
  consultations.forEach(c => {
    byModule[c.module] = (byModule[c.module] || 0) + 1;
  });

  const bySeverity = { high: 0, medium: 0, low: 0 };
  consultations.forEach(c => {
    if (c.severity) bySeverity[c.severity] = (bySeverity[c.severity] || 0) + 1;
  });

  const emergencies = consultations.filter(c => c.isEmergency).length;

  const byDate = {};
  consultations.forEach(c => {
    const date = new Date(c.timestamp).toLocaleDateString('es-MX');
    byDate[date] = (byDate[date] || 0) + 1;
  });

  const recentConsultations = consultations
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 15);

  return { total, byModule, bySeverity, emergencies, byDate, recentConsultations };
}

let db;

async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('modular');
  console.log('Conectado a MongoDB Atlas');
}

// ── Rutas ────────────────────────────────────────────────────

// Login de administrador
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { user, password } = req.body;

    if (!user || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const validUser = user === ADMIN_USER;
    const validPassword = await bcrypt.compare(password, ADMIN_PASSWORD);

    if (!validUser || !validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Guardar consulta — emite evento en tiempo real
app.post('/api/consultations', saveLimiter, async (req, res) => {
  try {
    const errors = validateConsultation(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors });
    }

    const { module, severity, isEmergency, answers, recommendations, sessionId } = req.body;

    const record = {
      module,
      severity,
      isEmergency,
      answers:         answers.map(a => String(a).slice(0, 200)),
      recommendations: recommendations.map(r => String(r).slice(0, 500)),
      sessionId:       sessionId ? String(sessionId).slice(0, 100) : null,
      timestamp:       new Date(),
    };

    const result = await db.collection('consultations').insertOne(record);

    // Emitir stats actualizadas a todos los clientes conectados
    const updatedStats = await buildStats(db.collection('consultations'));
    io.emit('stats_updated', updatedStats);

    // Emitir también la consulta nueva para notificación
    io.emit('new_consultation', {
      module: record.module,
      severity: record.severity,
      isEmergency: record.isEmergency,
      timestamp: record.timestamp,
    });

    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error guardando consulta:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Estadísticas
app.get('/api/stats', verifyAdmin, async (req, res) => {
  try {
    const stats = await buildStats(db.collection('consultations'));
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo stats:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Todas las consultas
app.get('/api/consultations', verifyAdmin, async (req, res) => {
  try {
    const consultations = await db.collection('consultations')
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    res.json(consultations);
  } catch (error) {
    console.error('Error obteniendo consultas:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Arrancar servidor ────────────────────────────────────────
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Stats API + Socket.io corriendo en puerto ${PORT}`);
  });
}).catch(console.error);