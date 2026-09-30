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

// POST /api/clientes - crear
router.post('/clientes', async (req, res) => {
  try {
    const pool = await getConnection();
    const request = pool.request()
      .input('CustomerName', sql.NVarChar(100), req.body.nombre)
      .input('CustomerCategoryID', sql.Int, req.body.categoria)
      .input('DeliveryMethodID', sql.Int, req.body.metodo)
      .input('DeliveryCityID', sql.Int, req.body.ciudad)
      .input('PrimaryContactPersonID', sql.Int, req.body.contacto)
      .input('PhoneNumber', sql.NVarChar(20), req.body.telefono || null)
      .input('WebsiteURL', sql.NVarChar(256), req.body.sitioWeb || null)
      .output('NuevoCustomerID', sql.Int);

    const result = await request.execute('Api.usp_Clientes_Crear');
    res.status(201).json({ CustomerID: result.output.NuevoCustomerID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/clientes/:id - modificar
router.put('/clientes/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    await pool.request()
      .input('CustomerID', sql.Int, req.params.id)
      .input('CustomerName', sql.NVarChar(100), req.body.nombre)
      .input('CustomerCategoryID', sql.Int, req.body.categoria)
      .input('DeliveryMethodID', sql.Int, req.body.metodo)
      .input('PhoneNumber', sql.NVarChar(20), req.body.telefono || null)
      .input('WebsiteURL', sql.NVarChar(256), req.body.sitioWeb || null)
      .execute('Api.usp_Clientes_Modificar');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/clientes/:id - eliminar
router.delete('/clientes/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    await pool.request()
      .input('CustomerID', sql.Int, req.params.id)
      .execute('Api.usp_Clientes_Eliminar');
    res.json({ ok: true });
    } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: error.message || 'Error interno al eliminar el cliente' });
  }
});

module.exports = router;
