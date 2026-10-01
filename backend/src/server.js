require('dotenv').config();
const express = require('express');
const cors = require('cors');
const commonRouter = require('./routes/common');
const clientesRouter = require('./routes/clientes');
const proveedoresRouter = require('./routes/proveedores');
const inventariosRouter = require('./routes/inventarios');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ status: 'activo' });
});

app.use('/api', commonRouter);
app.use('/api', clientesRouter);
app.use('/api', proveedoresRouter);
app.use('/api', inventariosRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});