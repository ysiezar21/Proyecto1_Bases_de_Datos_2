const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const esEdicion = !!id;

const form = document.getElementById('form-proveedor');
const tituloEl = document.getElementById('titulo');
const errorEl = document.getElementById('error');

const selectCategoria = document.getElementById('categoria');
const selectMetodo = document.getElementById('metodo');
const selectCiudad = document.getElementById('ciudad');
const selectContacto = document.getElementById('contacto');

function llenarSelect(select, items, valueKey, textKey) {
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = item[textKey];
    select.appendChild(opt);
  });
}

// El SP de detalle devuelve nombres (Categoria, MetodoEntrega), no los IDs,
// asi que para preseleccionar el combo correcto en modo edicion, buscamos
// la opcion cuyo texto coincide con el nombre que vino del detalle.
function seleccionarPorTexto(select, texto) {
  const opcion = Array.from(select.options).find(o => o.textContent === texto);
  if (opcion) select.value = opcion.value;
}

async function inicializar() {
  try {
    const [categorias, metodos, ciudades, personas] = await Promise.all([
      apiGet('/api/proveedores/categorias'),
      apiGet('/api/metodos-entrega'),
      apiGet('/api/ciudades'),
      apiGet('/api/personas')
    ]);

    llenarSelect(selectCategoria, categorias, 'SupplierCategoryID', 'SupplierCategoryName');
    llenarSelect(selectMetodo, metodos, 'DeliveryMethodID', 'DeliveryMethodName');
    llenarSelect(selectCiudad, ciudades, 'CityID', 'CityName');
    llenarSelect(selectContacto, personas, 'PersonID', 'FullName');

    if (esEdicion) {
      tituloEl.textContent = 'Editar proveedor';
      document.getElementById('titulo-tab').textContent = 'Editar proveedor';

      const c = await apiGet(`/api/proveedores/${id}`);
      document.getElementById('nombre').value = c.Nombre || '';
      document.getElementById('telefono').value = c.Telefono || '';
      document.getElementById('sitioWeb').value = c.SitioWeb || '';

      seleccionarPorTexto(selectCategoria, c.Categoria);
      seleccionarPorTexto(selectMetodo, c.MetodoEntrega);
      seleccionarPorTexto(selectCiudad, c.CiudadEntrega);
      seleccionarPorTexto(selectContacto, c.ContactoPrimario);
    }
  } catch (e) {
    errorEl.textContent = 'Error cargando datos: ' + e.message;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  const body = {
    nombre: document.getElementById('nombre').value.trim(),
    categoria: parseInt(selectCategoria.value),
    metodo: parseInt(selectMetodo.value),
    ciudad: parseInt(selectCiudad.value),
    contacto: parseInt(selectContacto.value),
    telefono: document.getElementById('telefono').value.trim(),
    sitioWeb: document.getElementById('sitioWeb').value.trim()
  };

  try {
    if (esEdicion) {
      await apiPut(`/api/proveedores/${id}`, body);
      window.location.href = `detalle_proveedores?id=${id}`;
    } else {
      const resultado = await apiPost('/api/proveedores', body);
      window.location.href = `detalle_proveedores?id=${resultado.SupplierID}`;
    }
  } catch (e) {
    errorEl.textContent = 'Error al guardar: ' + e.message;
  }
});

inicializar();
