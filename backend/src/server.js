require('dotenv').config();
const express = require('express');
const cors = require('cors');
const consultasRouter = require('./routes/consultas');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// Ruta raíz de health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'activo' });
});

// Rutas de consultas a la BD
app.use('/api', consultasRouter);

// Arrancar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});