const { Pool } = require('pg');

// Un Pool mantiene un conjunto de conexiones abiertas y las reparte entre
// las peticiones concurrentes. Para una API web esto es preferible a un
// Client único: evita reabrir una conexión TCP en cada request y evita que
// una consulta lenta bloquee al resto del tráfico.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render (y la mayoría de los Postgres administrados) exige SSL en
  // producción, pero un Postgres local para desarrollo normalmente no lo
  // soporta. Por eso solo lo activamos fuera de development.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Si una conexión del pool se cae por una razón ajena a una query concreta
// (por ejemplo, el servidor de base de datos se reinicia), 'error' es el
// único lugar donde nos enteramos. No hay un request al que responderle,
// así que lo correcto es loguear y dejar que el proceso muera para que el
// orquestador (Render) lo reinicie con un pool limpio.
pool.on('error', (err) => {
  console.error('Error inesperado en un cliente inactivo de PostgreSQL', err);
  process.exit(1);
});

module.exports = pool;
