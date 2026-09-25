require('dotenv').config();
const express = require('express');
const cors = require('cors');
const testRouter = require('./routes/test');
const clientesRouter = require('./routes/clientes');

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

// Rutas
app.use('/api', testRouter);
app.use('/api', clientesRouter);

// Arrancar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});