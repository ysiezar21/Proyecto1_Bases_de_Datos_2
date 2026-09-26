const express = require('express');
const { getConnection, sql } = require('../db');

const router = express.Router();

// ==================== SELECTS ====================

// GET /api/proveedores/categorias
router.get('/proveedores/categorias', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .execute('Api.usp_Proveedores_Categorias');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/proveedores?nombre=X&categoria=Y&metodo=Z
router.get('/proveedores', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), req.query.nombre || null)
      .input('SupplierCategoryID', sql.Int, req.query.categoria ? parseInt(req.query.categoria) : null)
      .input('DeliveryMethodID', sql.Int, req.query.metodo ? parseInt(req.query.metodo) : null)
      .execute('Api.usp_Proveedores_Listar');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/proveedores/:id
router.get('/proveedores/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SupplierID', sql.Int, req.params.id)
      .execute('Api.usp_Proveedores_Detalle');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;