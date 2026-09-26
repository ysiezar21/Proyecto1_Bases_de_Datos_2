const tbody = document.querySelector('#tabla-clientes tbody');
const tabla = document.getElementById('tabla-clientes');
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
      apiGet('/api/clientes/categorias'),
      apiGet('/api/clientes/metodos-entrega')
    ]);

    categorias.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.CustomerCategoryID;
      opt.textContent = c.CustomerCategoryName;
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
  }
}

// Cargar clientes aplicando filtros acumulativos
async function cargarClientes() {
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
    const clientes = await apiGet(`/api/clientes${query}`);

    if (clientes.length === 0) {
      sinResultados.hidden = false;
    } else {
      clientes.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><a href="detalle_clientes?id=${c.CustomerID}">${c.Nombre}</a></td>
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
document.getElementById('btn-buscar').addEventListener('click', cargarClientes);

inputNombre.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') cargarClientes();
});

selectCategoria.addEventListener('change', cargarClientes);
selectMetodo.addEventListener('change', cargarClientes);

document.getElementById('btn-restaurar').addEventListener('click', () => {
  inputNombre.value = '';
  selectCategoria.value = '';
  selectMetodo.value = '';
  cargarClientes();
});

// Inicializar
(async () => {
  await cargarFiltros();
  await cargarClientes();
})();