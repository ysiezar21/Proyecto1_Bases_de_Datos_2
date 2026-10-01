const express = require('express');
const { getConnection, sql } = require('../db');

const router = express.Router();

// GET /api/inventarios/grupos
router.get('/inventarios/grupos', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .execute('Api.usp_Inventario_Grupos');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventarios?nombre=X&grupo=Y&cantidad=Z
router.get('/inventarios', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), req.query.nombre || null)
      .input('StockGroupID', sql.Int, req.query.grupo ? parseInt(req.query.grupo) : null)
      .execute('Api.usp_Inventario_Listar');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventarios/:id
router.get('/inventarios/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('StockItemID', sql.Int, req.params.id)
      .execute('Api.usp_Inventario_Detalle');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
