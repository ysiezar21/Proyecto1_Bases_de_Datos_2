// ==================== HELPERS ====================
function $(sel) { return document.querySelector(sel); }

function llenarSelect(select, items, valueKey, textKey, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = item[textKey];
    select.appendChild(opt);
  });
}

function marcarErrorSelect(select, placeholder) {
  select.innerHTML = `<option value="">${placeholder} (error al cargar)</option>`;
}

function mostrarCargando(n, visible) {
  $(`#r${n}-cargando`).hidden = !visible;
  if (visible) $(`#r${n}-tabla`).hidden = true;
}

function mostrarError(n, msg) {
  $(`#r${n}-error`).textContent = msg || '';
}

function renderTabla(n, rows, columnas) {
  const tabla = $(`#r${n}-tabla`);
  const thead = tabla.querySelector('thead');
  const tbody = tabla.querySelector('tbody');

  if (!rows || rows.length === 0) {
    thead.innerHTML = '';
    tbody.innerHTML = `<tr><td style="text-align:center;padding:2rem;color:var(--color-text-muted)">Sin resultados</td></tr>`;
    tabla.hidden = false;
    return;
  }

  thead.innerHTML = '<tr>' + columnas.map(c => `<th>${c.label}</th>`).join('') + '</tr>';
  tbody.innerHTML = rows.map(row =>
    '<tr>' + columnas.map(c => `<td>${c.render ? c.render(row) : (row[c.key] ?? '—')}</td>`).join('') + '</tr>'
  ).join('');
  tabla.hidden = false;
}

function fmtMoney(v) {
  if (v == null) return '—';
  return '$' + parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ==================== NAVEGACIÓN ====================
document.querySelectorAll('.reporte-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const n = btn.dataset.reporte;
    document.querySelectorAll('.reporte-btn').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    document.querySelectorAll('.reporte-panel').forEach(p => p.hidden = true);
    $(`#reporte-${n}`).hidden = false;
    if (!btn.dataset.cargado) {
      cargarReporte(n);
      btn.dataset.cargado = '1';
    }
  });
});

// ==================== CARGA POR REPORTE ====================
async function cargarReporte(n) {
  try {
    switch (n) {
      case '1': await cargarR1(); break;
      case '2': await cargarR2(); break;
      case '3': await cargarR3(); break;
      case '4': await cargarR4(); break;
      case '5': await cargarR5(); break;
      case '6': await cargarR6(); break;
      case '7': await cargarR7(); break;
      case '8': await cargarR8(); break;
      case '9': await cargarR9(); break;
      case '10': await cargarR10(); break;
    }
  } catch (e) {
    mostrarError(n, 'Error: ' + e.message);
  }
}

// ---------- Reporte 1 ----------
async function cargarR1() {
  mostrarCargando(1, true); mostrarError(1, '');
  const params = new URLSearchParams();
  const cat = $('#r1-categoria').value.trim();
  const prov = $('#r1-proveedor').value.trim();
  if (cat) params.append('categoria', cat);
  if (prov) params.append('proveedor', prov);
  const rows = await apiGet('/api/estadisticas/compras-proveedores?' + params);
  mostrarCargando(1, false);
  renderTabla(1, rows, [
    { key: 'Categoria', label: 'Categoría' },
    { key: 'Proveedor', label: 'Proveedor' },
    { key: 'MontoMaximo', label: 'Máximo', render: r => fmtMoney(r.MontoMaximo) },
    { key: 'MontoMinimo', label: 'Mínimo', render: r => fmtMoney(r.MontoMinimo) },
    { key: 'MontoPromedio', label: 'Promedio', render: r => fmtMoney(r.MontoPromedio) }
  ]);
}

// ---------- Reporte 2 ----------
async function cargarR2() {
  mostrarCargando(2, true); mostrarError(2, '');
  const params = new URLSearchParams();
  const cat = $('#r2-categoria').value.trim();
  const cli = $('#r2-cliente').value.trim();
  if (cat) params.append('categoria', cat);
  if (cli) params.append('cliente', cli);
  const rows = await apiGet('/api/estadisticas/ventas-clientes?' + params);
  mostrarCargando(2, false);
  renderTabla(2, rows, [
    { key: 'Categoria', label: 'Categoría' },
    { key: 'Cliente', label: 'Cliente' },
    { key: 'MontoMaximo', label: 'Máximo', render: r => fmtMoney(r.MontoMaximo) },
    { key: 'MontoMinimo', label: 'Mínimo', render: r => fmtMoney(r.MontoMinimo) },
    { key: 'MontoPromedio', label: 'Promedio', render: r => fmtMoney(r.MontoPromedio) }
  ]);
}

// ---------- Reporte 3 ----------
async function cargarR3() {
  mostrarCargando(3, true); mostrarError(3, '');
  const params = new URLSearchParams();
  if ($('#r3-anio-desde').value) params.append('anioDesde', $('#r3-anio-desde').value);
  if ($('#r3-anio-hasta').value) params.append('anioHasta', $('#r3-anio-hasta').value);
  const rows = await apiGet('/api/estadisticas/top-productos?' + params);
  mostrarCargando(3, false);
  renderTabla(3, rows, [
    { key: 'Anio', label: 'Año' },
    { key: 'Posicion', label: '#' },
    { key: 'Producto', label: 'Producto' },
    { key: 'Ganancia', label: 'Ganancia', render: r => fmtMoney(r.Ganancia) }
  ]);
}

// ---------- Reporte 4 ----------
async function cargarR4() {
  mostrarCargando(4, true); mostrarError(4, '');
  const params = new URLSearchParams();
  if ($('#r4-anio-desde').value) params.append('anioDesde', $('#r4-anio-desde').value);
  if ($('#r4-anio-hasta').value) params.append('anioHasta', $('#r4-anio-hasta').value);
  const rows = await apiGet('/api/estadisticas/top-clientes?' + params);
  mostrarCargando(4, false);
  renderTabla(4, rows, [
    { key: 'Anio', label: 'Año' },
    { key: 'Posicion', label: '#' },
    { key: 'Cliente', label: 'Cliente' },
    { key: 'CantidadFacturas', label: 'Facturas' },
    { key: 'MontoTotal', label: 'Monto total', render: r => fmtMoney(r.MontoTotal) }
  ]);
}

// ---------- Reporte 5 ----------
async function cargarR5() {
  mostrarCargando(5, true); mostrarError(5, '');
  const params = new URLSearchParams();
  if ($('#r5-anio-desde').value) params.append('anioDesde', $('#r5-anio-desde').value);
  if ($('#r5-anio-hasta').value) params.append('anioHasta', $('#r5-anio-hasta').value);
  const rows = await apiGet('/api/estadisticas/top-proveedores?' + params);
  mostrarCargando(5, false);
  renderTabla(5, rows, [
    { key: 'Anio', label: 'Año' },
    { key: 'Posicion', label: '#' },
    { key: 'Proveedor', label: 'Proveedor' },
    { key: 'CantidadOrdenes', label: 'Órdenes' },
    { key: 'MontoTotal', label: 'Monto total', render: r => fmtMoney(r.MontoTotal) }
  ]);
}

// ---------- Reporte 6 ----------
async function cargarR6() {
  mostrarCargando(6, true); mostrarError(6, '');
  const rows = await apiGet('/api/estadisticas/matriz-ventas');
  mostrarCargando(6, false);
  const anios = ['2013', '2014', '2015', '2016'];
  renderTabla(6, rows, [
    { key: 'Categoria', label: 'Categoría' },
    ...anios.map(a => ({ key: a, label: a, render: r => fmtMoney(r[a]) })),
    { key: 'Total', label: 'Total', render: r => fmtMoney(r.Total) }
  ]);
}

// ---------- Reporte 7 ----------
let r7Pagina = 1;

async function cargarR7(pagina = 1) {
  r7Pagina = pagina;
  mostrarCargando(7, true); mostrarError(7, '');
  const params = new URLSearchParams();
  if ($('#r7-anio').value) params.append('anio', $('#r7-anio').value);
  if ($('#r7-mes').value) params.append('mes', $('#r7-mes').value);
  if ($('#r7-grupo').value) params.append('grupo', $('#r7-grupo').value);
  if ($('#r7-subgrupo').value) params.append('subgrupo', $('#r7-subgrupo').value);
  params.append('pagina', pagina);
  params.append('tamano', 20);

  const rows = await apiGet('/api/estadisticas/seguimiento-clientes?' + params);
  mostrarCargando(7, false);

  renderTabla(7, rows, [
    { key: 'Cliente', label: 'Cliente' },
    { key: 'Anio', label: 'Año' },
    { key: 'Mes', label: 'Mes' },
    { key: 'MontoTotal', label: 'Monto total', render: r => fmtMoney(r.MontoTotal) },
    { key: 'PrimeraFactura', label: 'Primera factura' },
    { key: 'UltimaFactura', label: 'Última factura' },
    { key: 'CantidadTotal', label: 'Cant. total' },
    { key: 'CantidadMinima', label: 'Cant. mín' },
    { key: 'CantidadMaxima', label: 'Cant. máx' }
  ]);

  const pag = $('#r7-paginacion');
  if (rows.length > 0) {
    const total = rows[0].TotalRegistros;
    const totalPaginas = Math.ceil(total / 20);
    $('#r7-pagina-info').textContent = `Página ${pagina} de ${totalPaginas} (${total} registros)`;
    $('#r7-prev').disabled = pagina <= 1;
    $('#r7-next').disabled = pagina >= totalPaginas;
    pag.hidden = false;
  } else {
    pag.hidden = true;
  }
}

// ---------- Reporte 8 ----------
let r8Pagina = 1;

async function cargarR8(pagina = 1) {
  r8Pagina = pagina;
  mostrarCargando(8, true); mostrarError(8, '');
  const params = new URLSearchParams();
  if ($('#r8-anio').value) params.append('anio', $('#r8-anio').value);
  if ($('#r8-mes').value) params.append('mes', $('#r8-mes').value);
  if ($('#r8-grupo').value) params.append('grupo', $('#r8-grupo').value);
  if ($('#r8-subgrupo').value) params.append('subgrupo', $('#r8-subgrupo').value);
  params.append('pagina', pagina);
  params.append('tamano', 20);

  const rows = await apiGet('/api/estadisticas/seguimiento-proveedores?' + params);
  mostrarCargando(8, false);

  renderTabla(8, rows, [
    { key: 'Proveedor', label: 'Proveedor' },
    { key: 'Anio', label: 'Año' },
    { key: 'Mes', label: 'Mes' },
    { key: 'MontoTotal', label: 'Monto total', render: r => fmtMoney(r.MontoTotal) },
    { key: 'PrimeraOrden', label: 'Primera orden' },
    { key: 'UltimaOrden', label: 'Última orden' },
    { key: 'CantidadTotal', label: 'Cant. total' },
    { key: 'CantidadMinima', label: 'Cant. mín' },
    { key: 'CantidadMaxima', label: 'Cant. máx' }
  ]);

  const pag = $('#r8-paginacion');
  if (rows.length > 0) {
    const total = rows[0].TotalRegistros;
    const totalPaginas = Math.ceil(total / 20);
    $('#r8-pagina-info').textContent = `Página ${pagina} de ${totalPaginas} (${total} registros)`;
    $('#r8-prev').disabled = pagina <= 1;
    $('#r8-next').disabled = pagina >= totalPaginas;
    pag.hidden = false;
  } else {
    pag.hidden = true;
  }
}

// ---------- Reporte 9 ----------
async function cargarR9() {
  mostrarCargando(9, true); mostrarError(9, '');
  const params = new URLSearchParams();
  if ($('#r9-grupo').value) params.append('grupo', $('#r9-grupo').value);
  if ($('#r9-anio').value) params.append('anio', $('#r9-anio').value);
  if ($('#r9-proveedor').value) params.append('proveedor', $('#r9-proveedor').value);
  const rows = await apiGet('/api/estadisticas/rotacion-inventario?' + params);
  mostrarCargando(9, false);
  renderTabla(9, rows, [
    { key: 'Producto', label: 'Producto' },
    { key: 'Proveedor', label: 'Proveedor' },
    { key: 'Categoria', label: 'Categoría' },
    { key: 'CantidadEnMano', label: 'En mano' },
    { key: 'CantidadVendida', label: 'Vendida' },
    { key: 'DiasRotacion', label: 'Días rotación', render: r => r.DiasRotacion ?? '—' }
  ]);
}

// ---------- Reporte 10 ----------
async function cargarR10() {
  mostrarCargando(10, true); mostrarError(10, '');
  const params = new URLSearchParams();
  if ($('#r10-anio').value) params.append('anio', $('#r10-anio').value);
  if ($('#r10-mes').value) params.append('mes', $('#r10-mes').value);
  if ($('#r10-categoria').value) params.append('categoriaCliente', $('#r10-categoria').value);
  if ($('#r10-grupo').value) params.append('grupo', $('#r10-grupo').value);
  if ($('#r10-producto').value) params.append('producto', $('#r10-producto').value);
  const rows = await apiGet('/api/estadisticas/metodo-envio-favorito?' + params);
  mostrarCargando(10, false);
  renderTabla(10, rows, [
    { key: 'Ciudad', label: 'Ciudad' },
    { key: 'Estado', label: 'Estado' },
    { key: 'MetodoEnvio', label: 'Método de envío' },
    { key: 'CantidadVentas', label: 'Ventas' },
    { key: 'Posicion', label: 'Posición' }
  ]);
}

// ==================== INICIALIZAR FILTROS AUXILIARES ====================
async function intentarLlenar(url, selectores, valueKey, textKey, placeholder) {
  try {
    const data = await apiGet(url);
    selectores.forEach(([sel, ph]) => {
      const el = $(sel);
      if (el) llenarSelect(el, data, valueKey, textKey, ph || placeholder);
    });
    return data;
  } catch (e) {
    selectores.forEach(([sel, ph]) => {
      const el = $(sel);
      if (el) marcarErrorSelect(el, ph || placeholder);
    });
    return [];
  }
}

// Recarga las subcategorías de productos filtradas por categoría
async function recargarSubcategorias(grupoSelect, subgrupoSelect) {
  const grupoId = grupoSelect.value;
  const placeholder = 'Todas las subcategorías';
  try {
    const url = grupoId
      ? `/api/estadisticas/subgrupos?grupo=${grupoId}`
      : '/api/estadisticas/subgrupos';
    const subgrupos = await apiGet(url);
    llenarSelect(subgrupoSelect, subgrupos, 'StockGroupID', 'StockGroupName', placeholder);
  } catch (e) {
    marcarErrorSelect(subgrupoSelect, placeholder);
    console.error('Error recargando subgrupos:', e);
  }
}

async function inicializarFiltros() {
  // Años de ventas
  await intentarLlenar(
    '/api/estadisticas/anios-ventas',
    [
      ['#r3-anio-desde', 'Año desde...'], ['#r3-anio-hasta', 'Año hasta...'],
      ['#r4-anio-desde', 'Año desde...'], ['#r4-anio-hasta', 'Año hasta...'],
      ['#r7-anio', 'Todos los años'], ['#r9-anio', 'Todos los años'], ['#r10-anio', 'Todos los años']
    ],
    'Anio', 'Anio', 'Todos los años'
  );

  // Años de compras
  await intentarLlenar(
    '/api/estadisticas/anios-compras',
    [['#r5-anio-desde', 'Año desde...'], ['#r5-anio-hasta', 'Año hasta...'], ['#r8-anio', 'Todos los años']],
    'Anio', 'Anio', 'Todos los años'
  );

  // Grupos de productos
  await intentarLlenar(
    '/api/inventarios/grupos',
    [
      ['#r7-grupo', 'Todas las categorias'], ['#r8-grupo', 'Todas las categorias'],
      ['#r9-grupo', 'Todas las categorias'], ['#r10-grupo', 'Todas las categorias de productos']
    ],
    'StockGroupID', 'StockGroupName', 'Todas las categorias'
  );

    // Subcategorías (inicialmente todos los grupos)
  await intentarLlenar(
    '/api/estadisticas/subgrupos',
    [
      ['#r7-subgrupo', 'Todas las subcategorías'],
      ['#r8-subgrupo', 'Todas las subcategorías']
    ],
    'StockGroupID', 'StockGroupName', 'Todas las subcategorías'
  );

  // Productos
  await intentarLlenar(
    '/api/estadisticas/productos',
    [['#r10-producto', 'Todos los productos']],
    'StockItemID', 'StockItemName', 'Todos los productos'
  );

  // Proveedores
  await intentarLlenar(
    '/api/proveedores',
    [['#r9-proveedor', 'Todos los proveedores']],
    'SupplierID', 'Nombre', 'Todos los proveedores'
  );

  // Categorías de clientes
  await intentarLlenar(
    '/api/clientes/categorias',
    [['#r10-categoria', 'Todas las categorías de clientes']],
    'CustomerCategoryID', 'CustomerCategoryName', 'Todas las categorías'
  );
}

// ==================== EVENTOS ====================
$('#r1-buscar').addEventListener('click', () => cargarR1());
$('#r1-limpiar').addEventListener('click', () => {
  $('#r1-categoria').value = ''; $('#r1-proveedor').value = ''; cargarR1();
});

$('#r2-buscar').addEventListener('click', () => cargarR2());
$('#r2-limpiar').addEventListener('click', () => {
  $('#r2-categoria').value = ''; $('#r2-cliente').value = ''; cargarR2();
});

$('#r3-buscar').addEventListener('click', () => cargarR3());
$('#r3-limpiar').addEventListener('click', () => {
  $('#r3-anio-desde').value = ''; $('#r3-anio-hasta').value = ''; cargarR3();
});

$('#r4-buscar').addEventListener('click', () => cargarR4());
$('#r4-limpiar').addEventListener('click', () => {
  $('#r4-anio-desde').value = ''; $('#r4-anio-hasta').value = ''; cargarR4();
});

$('#r5-buscar').addEventListener('click', () => cargarR5());
$('#r5-limpiar').addEventListener('click', () => {
  $('#r5-anio-desde').value = ''; $('#r5-anio-hasta').value = ''; cargarR5();
});

$('#r6-buscar').addEventListener('click', () => cargarR6());

$('#r7-buscar').addEventListener('click', () => cargarR7(1));
$('#r7-limpiar').addEventListener('click', () => {
  $('#r7-anio').value = ''; $('#r7-mes').value = '';
  $('#r7-grupo').value = ''; $('#r7-subgrupo').value = '';
  recargarSubcategorias($('#r7-grupo'), $('#r7-subgrupo'));
  cargarR7(1);
});
$('#r7-prev').addEventListener('click', () => cargarR7(r7Pagina - 1));
$('#r7-next').addEventListener('click', () => cargarR7(r7Pagina + 1));
$('#r7-grupo').addEventListener('change', () => {
  recargarSubcategorias($('#r7-grupo'), $('#r7-subgrupo'));
});

$('#r8-buscar').addEventListener('click', () => cargarR8(1));
$('#r8-limpiar').addEventListener('click', () => {
  $('#r8-anio').value = ''; $('#r8-mes').value = '';
  $('#r8-grupo').value = ''; $('#r8-subgrupo').value = '';
  recargarSubcategorias($('#r8-grupo'), $('#r8-subgrupo'));
  cargarR8(1);
});
$('#r8-prev').addEventListener('click', () => cargarR8(r8Pagina - 1));
$('#r8-next').addEventListener('click', () => cargarR8(r8Pagina + 1));
$('#r8-grupo').addEventListener('change', () => {
  recargarSubcategorias($('#r8-grupo'), $('#r8-subgrupo'));
});

$('#r9-buscar').addEventListener('click', () => cargarR9());
$('#r9-limpiar').addEventListener('click', () => {
  $('#r9-grupo').value = ''; $('#r9-anio').value = ''; $('#r9-proveedor').value = '';
  cargarR9();
});

$('#r10-buscar').addEventListener('click', () => cargarR10());
$('#r10-limpiar').addEventListener('click', () => {
  $('#r10-anio').value = ''; $('#r10-mes').value = '';
  $('#r10-categoria').value = ''; $('#r10-grupo').value = ''; $('#r10-producto').value = '';
  cargarR10();
});

// ==================== ARRANQUE ====================
(async () => {
  await inicializarFiltros();
  await cargarR1();
})();