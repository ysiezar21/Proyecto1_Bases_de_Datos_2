const express = require('express');
const { getConnection, sql } = require('../db');

const router = express.Router();

// Ruta de prueba: verificar conexión a la BD
router.get('/test', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT 1 AS ok');
    res.json({ conectado: true, resultado: result.recordset });
  } catch (error) {
    res.status(500).json({ conectado: false, error: error.message });
  }
});

// Aquí agregarás tus consultas específicas más adelante
// router.get('/tabla1', async (req, res) => { ... });

module.exports = router;