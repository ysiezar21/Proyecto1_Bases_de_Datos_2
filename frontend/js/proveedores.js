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
    const [categorias, metodos] = await Promise.all([
      apiGet('/api/proveedores/categorias'),
      apiGet('/api/metodos-entrega')
    ]);

    categorias.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.SupplierCategoryID;        // ← corregido
      opt.textContent = c.SupplierCategoryName; // ← corregido
      selectCategoria.appendChild(opt);
    });

    metodos.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.DeliveryMethodID;
      opt.textContent = m.DeliveryMethodName;
      selectMetodo.appendChild(opt);
    });
  } catch (e) {
    console.error('Error cargando filtros:', e);
    errorEl.textContent = 'Error al cargar filtros: ' + e.message;
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
  if (selectMetodo.value) params.append('metodo', selectMetodo.value);

  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    const proveedores = await apiGet(`/api/proveedores${query}`);

    if (proveedores.length === 0) {
      sinResultados.hidden = false;
    } else {
      proveedores.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><a href="detalle_proveedores.html?id=${s.SupplierID}">${s.Nombre}</a></td>
          <td>${s.Categoria}</td>
          <td>${s.MetodoEntrega}</td>
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
selectMetodo.addEventListener('change', cargarProveedores);

document.getElementById('btn-restaurar').addEventListener('click', () => {
  inputNombre.value = '';
  selectCategoria.value = '';
  selectMetodo.value = '';
  cargarProveedores();
});

// Inicializar
(async () => {
  await cargarFiltros();
  await cargarProveedores();
})();