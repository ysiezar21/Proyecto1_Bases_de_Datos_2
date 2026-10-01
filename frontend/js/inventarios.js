const tbody = document.querySelector('#tabla-inventarios tbody');
const tabla = document.getElementById('tabla-inventarios');
const cargando = document.getElementById('cargando');
const sinResultados = document.getElementById('sin-resultados');
const errorEl = document.getElementById('error');
const inputNombre = document.getElementById('filtro-nombre');
const selectGrupo = document.getElementById('filtro-grupo');

// Cargar selects al abrir la página
async function cargarFiltros() {
  try {
    const [grupos] = await Promise.all([
      apiGet('/api/inventarios/grupos'),
    ]);

    grupos.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.StockGroupID;
      opt.textContent = c.StockGroupName;
      selectGrupo.appendChild(opt);
    });

  } catch (e) {
    console.error('Error cargando filtros:', e);
  }
}

// Cargar productos aplicando filtros acumulativos
async function cargarProductos() {
  tbody.innerHTML = '';
  errorEl.textContent = '';
  sinResultados.hidden = true;
  cargando.hidden = false;
  tabla.hidden = true;

  const params = new URLSearchParams();
  const nombre = inputNombre.value.trim();
  if (nombre) params.append('nombre', nombre);
  if (selectGrupo.value) params.append('grupo', selectGrupo.value);

  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    const productos = await apiGet(`/api/inventarios${query}`);

    if (productos.length === 0) {
      sinResultados.hidden = false;
    } else {
      productos.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><a href="detalle_inventarios?id=${c.StockItemID}">${c.Nombre}</a></td>
          <td>${c.Grupo}</td>
          <td>${c.CantidadInventario}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (e) {
    errorEl.textContent = 'Error: ' + e.message;
  } finally {
    cargando.hidden = true;
    tabla.hidden = false;
  }
}

// Eventos
document.getElementById('btn-buscar').addEventListener('click', cargarProductos);

inputNombre.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') cargarProductos();
});

selectGrupo.addEventListener('change', cargarProductos);

document.getElementById('btn-restaurar').addEventListener('click', () => {
  inputNombre.value = '';
  selectGrupo.value = '';
  cargarProductos();
});

// Inicializar
(async () => {
  await cargarFiltros();
  await cargarProductos();
})();