const express = require('express');
const { getConnection, sql } = require('../db');

const router = express.Router();

// GET /api/clientes/categorias
router.get('/clientes/categorias', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .execute('Api.usp_Clientes_Categorias');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/clientes/metodos-entrega
router.get('/clientes/metodos-entrega', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .execute('Api.usp_MetodosEntrega_Listar');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/clientes?nombre=X&categoria=Y&metodo=Z
router.get('/clientes', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), req.query.nombre || null)
      .input('CustomerCategoryID', sql.Int, req.query.categoria ? parseInt(req.query.categoria) : null)
      .input('DeliveryMethodID', sql.Int, req.query.metodo ? parseInt(req.query.metodo) : null)
      .execute('Api.usp_Clientes_Listar');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/clientes/:id
router.get('/clientes/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('CustomerID', sql.Int, req.params.id)
      .execute('Api.usp_Clientes_Detalle');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;