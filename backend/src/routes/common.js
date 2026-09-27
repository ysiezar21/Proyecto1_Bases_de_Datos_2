const express = require('express');
const { getConnection } = require('../db');

const router = express.Router();

// GET /api/metodos-entrega
router.get('/metodos-entrega', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().execute('Api.usp_MetodosEntrega_Listar');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ciudades
router.get('/ciudades', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().execute('Api.usp_Ciudades_Listar');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/personas
router.get('/personas', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().execute('Api.usp_Personas_Listar');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;