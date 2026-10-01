const express = require('express');
const { getConnection, sql } = require('../db');

const router = express.Router();

// GET /api/ventas?nombre=X&metodoEntrega=Y&fechaDesde=Z&fechaHasta=W&montoMin=A&montoMax=B&pagina=N
router.get('/ventas', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), req.query.nombre || null)
      .input('DeliveryMethodID', sql.Int, req.query.metodoEntrega ? parseInt(req.query.metodoEntrega) : null)
      .input('FechaDesde', sql.VarChar(10), req.query.fechaDesde || null)
      .input('FechaHasta', sql.VarChar(10), req.query.fechaHasta || null)
      .input('MontoMin', sql.Decimal(18, 2), req.query.montoMin ? parseFloat(req.query.montoMin) : null)
      .input('MontoMax', sql.Decimal(18, 2), req.query.montoMax ? parseFloat(req.query.montoMax) : null)
      .input('Pagina', sql.Int, parseInt(req.query.pagina) || 1)
      .execute('Api.usp_Ventas_Listar');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ventas/:id
router.get('/ventas/:id', async (req, res) => {
  try {
    const pool = await getConnection();

    const encabezado = await pool.request()
      .input('InvoiceID', sql.Int, req.params.id)
      .execute('Api.usp_Ventas_Detalle');

    if (encabezado.recordset.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const lineas = await pool.request()
      .input('InvoiceID', sql.Int, req.params.id)
      .execute('Api.usp_Ventas_Lineas');

    res.json({
      encabezado: encabezado.recordset[0],
      lineas: lineas.recordset
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;