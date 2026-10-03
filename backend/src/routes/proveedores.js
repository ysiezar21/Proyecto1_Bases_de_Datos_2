const express = require('express');
const { getConnection, sql } = require('../db');

const router = express.Router();

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

// GET /api/proveedores?nombre=X&categoria=Y
router.get('/proveedores', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), req.query.nombre || null)
      .input('SupplierCategoryID', sql.Int, req.query.categoria ? parseInt(req.query.categoria) : null)
      .input('Pagina', sql.Int, parseInt(req.query.pagina) || 1)
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

// POST /api/proveedores - crear
router.post('/proveedores', async (req, res) => {
  try {
    const pool = await getConnection();
    const request = pool.request()
      .input('SupplierName', sql.NVarChar(100), req.body.nombre)
      .input('SupplierCategoryID', sql.Int, req.body.categoria)
      .input('DeliveryMethodID', sql.Int, req.body.metodo)
      .input('DeliveryCityID', sql.Int, req.body.ciudad)
      .input('PrimaryContactPersonID', sql.Int, req.body.contacto)
      .input('PhoneNumber', sql.NVarChar(20), req.body.telefono || null)
      .input('WebsiteURL', sql.NVarChar(256), req.body.sitioWeb || null)
      .output('NuevoSupplierID', sql.Int);

    const result = await request.execute('Api.usp_Proveedores_Crear');
    res.status(201).json({ SupplierID: result.output.NuevoSupplierID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/proveedores/:id - modificar
router.put('/proveedores/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    await pool.request()
      .input('SupplierID', sql.Int, req.params.id)
      .input('SupplierName', sql.NVarChar(100), req.body.nombre)
      .input('SupplierCategoryID', sql.Int, req.body.categoria)
      .input('DeliveryMethodID', sql.Int, req.body.metodo)
      .input('PhoneNumber', sql.NVarChar(20), req.body.telefono || null)
      .input('WebsiteURL', sql.NVarChar(256), req.body.sitioWeb || null)
      .execute('Api.usp_Proveedores_Modificar');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/proveedores/:id - eliminar
router.delete('/proveedores/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    await pool.request()
      .input('SupplierID', sql.Int, req.params.id)
      .execute('Api.usp_Proveedores_Eliminar');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
