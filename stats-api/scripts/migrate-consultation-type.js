// Migración: asigna `consultationType` a las consultas guardadas ANTES del switch.
//
// Uso (desde la carpeta stats-api, con MONGODB_URI en tu .env):
//   node scripts/migrate-consultation-type.js                       → solo muestra cuántas hay (no escribe nada)
//   node scripts/migrate-consultation-type.js --apply               → las marca como 'unclassified'
//   node scripts/migrate-consultation-type.js --apply --as=training → las marca como 'training'
//
// Es opcional: el servidor ya trata las consultas sin el campo como
// 'unclassified' al leerlas. Esto solo deja el dato explícito en la base.
// Solo toca documentos que NO tienen el campo; es seguro repetirlo.
require('dotenv').config();
const { MongoClient } = require('mongodb');

const apply = process.argv.includes('--apply');
const asArg = process.argv.find(a => a.startsWith('--as='));
const target = asArg ? asArg.split('=')[1] : 'unclassified';

if (!['unclassified', 'training', 'real'].includes(target)) {
  console.error(`Valor inválido para --as: "${target}" (usa unclassified, training o real)`);
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('Falta MONGODB_URI en el entorno (.env)');
  process.exit(1);
}

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const col = client.db('modular').collection('consultations');
    const filter = { consultationType: { $exists: false } };
    const pending = await col.countDocuments(filter);
    console.log(`Consultas sin 'consultationType': ${pending}`);

    if (!apply) {
      console.log(`(Simulación) Con --apply se marcarían como '${target}'.`);
      return;
    }
    const res = await col.updateMany(filter, { $set: { consultationType: target } });
    console.log(`Actualizadas: ${res.modifiedCount} → '${target}'`);
  } finally {
    await client.close();
  }
})().catch(err => {
  console.error('Error en la migración:', err.message);
  process.exit(1);
});
