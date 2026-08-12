require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // evita ENETUNREACH: Railway no tiene salida IPv6
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');
const { createServer } = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
app.set('trust proxy', 1); // Railway corre detrás de un proxy
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// ── Correo (Gmail + Nodemailer) ──────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  family: 4,                // fuerza IPv4 (Railway no tiene salida IPv6)
  connectionTimeout: 10000, // 10s máx para conectar
  greetingTimeout: 10000,   // 10s máx para el saludo SMTP
  socketTimeout: 10000,     // 10s máx de inactividad en el socket
});

async function sendVerificationEmail(email, username, token) {
  const verifyLink = `${APP_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Modular2026" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verifica tu cuenta — Modular2026',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1f2937;">¡Hola, ${username}!</h2>
          <p style="color: #4b5563;">Gracias por registrarte en Modular2026. Confirma tu cuenta para empezar a estudiar.</p>
          <a href="${verifyLink}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Verificar mi cuenta
          </a>
          <p style="color: #9ca3af; font-size: 12px;">Si no creaste esta cuenta, ignora este correo. Este enlace expira en 24 horas.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error enviando correo de verificación:', error.message);
  }
}

// ── NUEVO: correo de recuperación de contraseña ────────────────
async function sendResetEmail(email, username, token) {
  const resetLink = `${APP_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Modular2026" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Recupera tu contraseña — Modular2026',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Hola, ${username}</h2>
          <p style="color: #4b5563;">Recibimos una solicitud para restablecer tu contraseña. Este enlace expira en 1 hora.</p>
          <a href="${resetLink}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Restablecer contraseña
          </a>
          <p style="color: #9ca3af; font-size: 12px;">Si no solicitaste esto, ignora este correo.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error enviando correo de reseteo:', error.message);
  }
}

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://localhost',
  'capacitor://localhost',
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

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados registros desde esta IP. Intenta más tarde.' },
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

function verifyUser(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'user') {
      return res.status(403).json({ error: 'Token inválido para esta ruta' });
    }
    req.userId = decoded.userId;
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

function validateRegistration({ email, password, username }) {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) errors.push('Email inválido');
  if (!password || password.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres');
  if (!username || username.trim().length < 3) errors.push('El nombre de usuario debe tener al menos 3 caracteres');

  return errors;
}

function updateStreak(user) {
  const today = new Date().toISOString().slice(0, 10);
  const last = user.streak?.lastActivityDate;

  if (last === today) {
    return user.streak;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const current = last === yesterday ? (user.streak?.current || 0) + 1 : 1;
  const longest = Math.max(current, user.streak?.longest || 0);

  return { current, longest, lastActivityDate: today };
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

// ── Registro de usuario ─────────────────────────────────────
app.post('/api/auth/register', registerLimiter, async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const errors = validateRegistration({ email, password, username });
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors });
    }

    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = {
      email: email.toLowerCase(),
      username: username.trim(),
      passwordHash,
      createdAt: new Date(),
      isVerified: false,
      verificationToken,
      verificationExpires,
      streak: { current: 0, longest: 0, lastActivityDate: null },
      xp: 0,
      level: 1,
      completedLessons: [],
    };

    await db.collection('users').insertOne(newUser);

    // No bloqueamos la respuesta esperando el correo — si Gmail
    // está lento o mal configurado, el registro no debe colgarse.
    sendVerificationEmail(newUser.email, newUser.username, verificationToken)
      .catch(err => console.error('Fallo enviando verificación (no bloqueante):', err.message));

    res.status(201).json({
      message: 'Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.'
    });
  } catch (error) {
    console.error('Error en registro:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Verificar email ───────────────────────────────────────────
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token requerido' });

    const user = await db.collection('users').findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o ya usado' });
    }

    if (user.verificationExpires < new Date()) {
      return res.status(400).json({ error: 'El enlace de verificación expiró. Solicita uno nuevo.' });
    }

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: '', verificationExpires: '' }
      }
    );

    res.json({ message: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error verificando email:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Reenviar verificación ────────────────────────────────────
app.post('/api/auth/resend-verification', registerLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.collection('users').findOne({ email: email?.toLowerCase() });

    if (!user) {
      return res.json({ message: 'Si el correo existe, se envió un nuevo enlace de verificación.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Esta cuenta ya está verificada.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { verificationToken, verificationExpires } }
    );

    sendVerificationEmail(user.email, user.username, verificationToken)
      .catch(err => console.error('Fallo reenviando verificación (no bloqueante):', err.message));

    res.json({ message: 'Si el correo existe, se envió un nuevo enlace de verificación.' });
  } catch (error) {
    console.error('Error reenviando verificación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── NUEVO: Solicitar recuperación de contraseña ────────────────
app.post('/api/auth/forgot-password', registerLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.collection('users').findOne({ email: email?.toLowerCase() });

    // Respuesta genérica siempre, para no revelar qué correos existen
    if (!user) {
      return res.json({ message: 'Si el correo existe, se envió un enlace de recuperación.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { resetToken, resetExpires } }
    );

    sendResetEmail(user.email, user.username, resetToken)
      .catch(err => console.error('Fallo enviando reset (no bloqueante):', err.message));

    res.json({ message: 'Si el correo existe, se envió un enlace de recuperación.' });
  } catch (error) {
    console.error('Error en forgot-password:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── NUEVO: Restablecer contraseña ───────────────────────────────
app.post('/api/auth/reset-password', registerLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token y contraseña requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const user = await db.collection('users').findOne({ resetToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o ya usado' });
    }
    if (user.resetExpires < new Date()) {
      return res.status(400).json({ error: 'El enlace expiró. Solicita uno nuevo.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { passwordHash },
        $unset: { resetToken: '', resetExpires: '' }
      }
    );

    res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error en reset-password:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Login de usuario ─────────────────────────────────────────
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Debes verificar tu correo antes de iniciar sesión', needsVerification: true });
    }

    const token = jwt.sign(
      { userId: user._id, type: 'user' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        completedLessons: user.completedLessons,
      }
    });
  } catch (error) {
    console.error('Error en login de usuario:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Perfil del usuario actual ────────────────────────────────
app.get('/api/users/me', verifyUser, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.userId) },
      { projection: { passwordHash: 0 } }
    );
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    console.error('Error obteniendo perfil:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Listado de lecciones ─────────────────────────────────────
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await db.collection('lessons')
      .find({})
      .project({ questions: 0 })
      .sort({ module: 1, order: 1 })
      .toArray();
    res.json(lessons);
  } catch (error) {
    console.error('Error obteniendo lecciones:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Detalle de una lección (con preguntas) ───────────────────
app.get('/api/lessons/:id', verifyUser, async (req, res) => {
  try {
    const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(req.params.id) });
    if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });

    const safeLesson = {
      ...lesson,
      questions: lesson.questions.map(q => ({
        question: q.question,
        options: q.options,
      })),
    };
    res.json(safeLesson);
  } catch (error) {
    console.error('Error obteniendo lección:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Completar lección: valida respuestas, otorga XP y racha ──
app.post('/api/lessons/:id/complete', verifyUser, saveLimiter, async (req, res) => {
  try {
    const { answers } = req.body;

    const lesson = await db.collection('lessons').findOne({ _id: new ObjectId(req.params.id) });
    if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });

    if (!Array.isArray(answers) || answers.length !== lesson.questions.length) {
      return res.status(400).json({ error: 'Respuestas inválidas' });
    }

    let correctCount = 0;
    const results = lesson.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correctCount++;
      return { isCorrect, correctIndex: q.correctIndex, explanation: q.explanation };
    });

    const perfectScore = correctCount === lesson.questions.length;
    const xpEarned = perfectScore ? lesson.xpReward : Math.round(lesson.xpReward * 0.5);

    const user = await db.collection('users').findOne({ _id: new ObjectId(req.userId) });
    const newStreak = updateStreak(user);
    const newXp = (user.xp || 0) + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1;

    const alreadyCompleted = user.completedLessons.includes(String(lesson._id));
    const completedLessons = alreadyCompleted
      ? user.completedLessons
      : [...user.completedLessons, String(lesson._id)];

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.userId) },
      { $set: { xp: newXp, level: newLevel, streak: newStreak, completedLessons } }
    );

    await db.collection('lesson_attempts').insertOne({
      userId: new ObjectId(req.userId),
      lessonId: lesson._id,
      score: correctCount,
      totalQuestions: lesson.questions.length,
      completedAt: new Date(),
    });

    res.json({
      results,
      correctCount,
      totalQuestions: lesson.questions.length,
      xpEarned,
      xp: newXp,
      level: newLevel,
      leveledUp: newLevel > user.level,
      streak: newStreak,
    });
  } catch (error) {
    console.error('Error completando lección:', error.message);
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