const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

let db;

async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('modular');
  console.log('Conectado a MongoDB Atlas');
}

// Guardar consulta
app.post('/api/consultations', async (req, res) => {
  try {
    const { module, severity, isEmergency, answers, recommendations, sessionId } = req.body;
    const record = {
      module,
      severity,
      isEmergency,
      answers,
      recommendations,
      sessionId,
      timestamp: new Date()
    };
    const result = await db.collection('consultations').insertOne(record);
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas
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
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las consultas
app.get('/api/consultations', async (req, res) => {
  try {
    const consultations = await db.collection('consultations')
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Stats API corriendo en puerto ${PORT}`);
  });
}).catch(console.error);