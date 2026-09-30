const tbody = document.querySelector('#tabla-proveedores tbody');
const tabla = document.getElementById('tabla-proveedores');
const cargando = document.getElementById('cargando');
const sinResultados = document.getElementById('sin-resultados');
const errorEl = document.getElementById('error');
const inputNombre = document.getElementById('filtro-nombre');
const selectCategoria = document.getElementById('filtro-categoria');
const selectMetodo = document.getElementById('filtro-metodo');

// Cargar selects al abrir la página
async function cargarFiltros() {
  try {
    const categorias = await apiGet('/api/proveedores/categorias');

    categorias.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.SupplierCategoryID;
      opt.textContent = c.SupplierCategoryName;
      selectCategoria.appendChild(opt);
    });
  } catch (e) {
    console.error('Error cargando filtros:', e);
  }
}

// Cargar proveedores aplicando filtros acumulativos
async function cargarProveedores() {
  tbody.innerHTML = '';
  errorEl.textContent = '';
  sinResultados.hidden = true;
  cargando.hidden = false;
  tabla.hidden = true;

  const params = new URLSearchParams();
  const nombre = inputNombre.value.trim();
  if (nombre) params.append('nombre', nombre);
  if (selectCategoria.value) params.append('categoria', selectCategoria.value);
  

  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    const proveedores = await apiGet(`/api/proveedores${query}`);

    if (proveedores.length === 0) {
      sinResultados.hidden = false;
    } else {
      proveedores.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><a href="detalle_proveedores?id=${c.SupplierID}">${c.Nombre}</a></td>
          <td>${c.Categoria}</td>
          <td>${c.MetodoEntrega}</td>
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
document.getElementById('btn-buscar').addEventListener('click', cargarProveedores);

inputNombre.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') cargarProveedores();
});

selectCategoria.addEventListener('change', cargarProveedores);


document.getElementById('btn-restaurar').addEventListener('click', () => {
  inputNombre.value = '';
  selectCategoria.value = '';
  
  cargarProveedores();
});

// Inicializar
(async () => {
  await cargarFiltros();
  await cargarProveedores();
})();