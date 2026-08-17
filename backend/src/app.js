const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Cualquier ruta no registrada cae aquí.
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado.' });
});

// Error handler centralizado. Los controllers envueltos en asyncHandler
// terminan aquí si algo lanza (por ejemplo, que la base de datos esté
// caída), en vez de tumbar el proceso o dejar la petición sin respuesta.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

module.exports = app;
