const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// ── Seguridad: cabeceras HTTP ────────────────────────────────
app.use(helmet());

// ── Seguridad: CORS ──────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))) {
      return callback(null, true);
    }
    // En producción permitir dominios de Vercel
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error('CORS no permitido'));
  }
}));

// Limitar tamaño del body
app.use(express.json({ limit: '10kb' }));

// ── Seguridad: Rate limiting ─────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
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

app.use(generalLimiter);

// ── Validación de entrada ────────────────────────────────────
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

let db;

async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('modular');
  console.log('Conectado a MongoDB Atlas');
}

// ── Rutas ────────────────────────────────────────────────────

// Guardar consulta
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
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error guardando consulta:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    const consultations = await db.collection('consultations').find({}).toArray();
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

    res.json({ total, byModule, bySeverity, emergencies, byDate, recentConsultations });
  } catch (error) {
    console.error('Error obteniendo stats:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Todas las consultas
app.get('/api/consultations', async (req, res) => {
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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Stats API corriendo en puerto ${PORT}`);
  });
}).catch(console.error);