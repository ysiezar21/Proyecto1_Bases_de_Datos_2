const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const esEdicion = !!id;

const form = document.getElementById('form-cliente');
const tituloEl = document.getElementById('titulo');
const errorEl = document.getElementById('error');
const btnGuardar = document.getElementById('btn-guardar');

const selectCategoria = document.getElementById('categoria');
const selectGrupo = document.getElementById('grupoCompra');
const selectMetodo = document.getElementById('metodo');
const selectClienteFacturar = document.getElementById('clienteFacturar');
const selectContacto = document.getElementById('contacto');
const selectContactoAlterno = document.getElementById('contactoAlterno');
const selectCiudad = document.getElementById('ciudad');
const inputDiasPago = document.getElementById('diasPago');
const inputLatitud = document.getElementById('latitud');
const inputLongitud = document.getElementById('longitud');

// Lee un campo de texto sin espacios al inicio ni al final
function texto(idCampo) {
  return document.getElementById(idCampo).value.trim();
}

// Número del select, o null si no se eligió nada
function numeroOpcional(select) {
  return select.value ? parseInt(select.value) : null;
}

// Número del input, o null si está vacío (el 0 es un valor válido)
function decimalOpcional(input) {
  return input.value === '' ? null : parseFloat(input.value);
}

// Valor de latitud/longitud para mostrar en el input
function coordenada(valor) {
  return valor === null || valor === undefined ? '' : Number(valor).toFixed(6);
}

// Llena un select; la primera opción (valor vacío) es el texto de ayuda
function llenarSelect(select, items, valueKey, textKey, textoVacio) {
  const vacio = document.createElement('option');
  vacio.value = '';
  vacio.textContent = textoVacio;
  select.appendChild(vacio);

  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = item[textKey];
    select.appendChild(opt);
  });
}

async function inicializar() {
  try {
    const [categorias, grupos, metodos, clientes, personas, ciudades] = await Promise.all([
      apiGet('/api/clientes/categorias'),
      apiGet('/api/clientes/grupos-compra'),
      apiGet('/api/metodos-entrega'),
      apiGet('/api/clientes/lista'),
      apiGet('/api/personas'),
      apiGet('/api/ciudades')
    ]);

    llenarSelect(selectCategoria, categorias, 'CustomerCategoryID', 'CustomerCategoryName', 'Seleccione una categoría');
    llenarSelect(selectGrupo, grupos, 'BuyingGroupID', 'BuyingGroupName', 'Sin grupo de compra');
    llenarSelect(selectMetodo, metodos, 'DeliveryMethodID', 'DeliveryMethodName', 'Seleccione un método');
    llenarSelect(selectClienteFacturar, clientes, 'CustomerID', 'CustomerName', 'Este mismo cliente');
    llenarSelect(selectContacto, personas, 'PersonID', 'FullName', 'Seleccione un contacto');
    llenarSelect(selectContactoAlterno, personas, 'PersonID', 'FullName', 'Sin contacto alterno');
    llenarSelect(selectCiudad, ciudades, 'CityID', 'CityName', 'Seleccione una ciudad');

    if (esEdicion) {
      tituloEl.textContent = 'Editar cliente';
      document.getElementById('titulo-tab').textContent = 'Editar cliente';

      const c = await apiGet(`/api/clientes/${id}`);
      document.getElementById('nombre').value = c.Nombre || '';
      selectCategoria.value = c.CustomerCategoryID;
      selectGrupo.value = c.BuyingGroupID ?? '';
      selectMetodo.value = c.DeliveryMethodID;
      // Si se factura a sí mismo se deja la opción "Este mismo cliente"
      selectClienteFacturar.value = c.BillToCustomerID === c.CustomerID ? '' : c.BillToCustomerID;
      selectContacto.value = c.PrimaryContactPersonID;
      selectContactoAlterno.value = c.AlternateContactPersonID ?? '';
      inputDiasPago.value = c.DiasGraciaPago;
      document.getElementById('telefono').value = c.Telefono || '';
      document.getElementById('fax').value = c.Fax || '';
      document.getElementById('sitioWeb').value = c.SitioWeb || '';
      document.getElementById('direccionEntrega1').value = c.DireccionEntrega1 || '';
      document.getElementById('direccionEntrega2').value = c.DireccionEntrega2 || '';
      selectCiudad.value = c.DeliveryCityID;
      document.getElementById('codigoPostal').value = c.CodigoPostal || '';
      document.getElementById('direccionPostal1').value = c.DireccionPostal1 || '';
      document.getElementById('direccionPostal2').value = c.DireccionPostal2 || '';
      inputLatitud.value = coordenada(c.Latitud);
      inputLongitud.value = coordenada(c.Longitud);
    }
  } catch (e) {
    errorEl.textContent = 'Error cargando datos: ' + e.message;
  }
}

// Validaciones que el navegador no hace (campos solo con espacios y ubicación incompleta)
function validar(body) {
  const obligatorios = [
    [body.nombre, 'El nombre'],
    [body.telefono, 'El teléfono'],
    [body.fax, 'El fax'],
    [body.sitioWeb, 'El sitio web'],
    [body.direccionEntrega1, 'La dirección de entrega'],
    [body.codigoPostal, 'El código postal'],
    [body.direccionPostal1, 'La dirección postal']
  ];

  for (const [valor, nombre] of obligatorios) {
    if (!valor) return `${nombre} es obligatorio.`;
  }

  const hayLatitud = body.latitud !== null;
  const hayLongitud = body.longitud !== null;
  if (hayLatitud !== hayLongitud) {
    return 'La latitud y la longitud se deben indicar juntas.';
  }

  return '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  const body = {
    nombre: texto('nombre'),
    categoria: parseInt(selectCategoria.value),
    grupoCompra: numeroOpcional(selectGrupo),
    metodo: parseInt(selectMetodo.value),
    clienteFacturar: numeroOpcional(selectClienteFacturar),
    contacto: parseInt(selectContacto.value),
    contactoAlterno: numeroOpcional(selectContactoAlterno),
    diasPago: parseInt(inputDiasPago.value),
    telefono: texto('telefono'),
    fax: texto('fax'),
    sitioWeb: texto('sitioWeb'),
    direccionEntrega1: texto('direccionEntrega1'),
    direccionEntrega2: texto('direccionEntrega2'),
    ciudad: parseInt(selectCiudad.value),
    codigoPostal: texto('codigoPostal'),
    direccionPostal1: texto('direccionPostal1'),
    direccionPostal2: texto('direccionPostal2'),
    latitud: decimalOpcional(inputLatitud),
    longitud: decimalOpcional(inputLongitud)
  };

  const mensaje = validar(body);
  if (mensaje) {
    errorEl.textContent = 'Error: ' + mensaje;
    return;
  }

  btnGuardar.disabled = true;

  try {
    if (esEdicion) {
      await apiPut(`/api/clientes/${id}`, body);
      window.location.href = `detalle_clientes?id=${id}`;
    } else {
      const resultado = await apiPost('/api/clientes', body);
      window.location.href = `detalle_clientes?id=${resultado.CustomerID}`;
    }
  } catch (e) {
    errorEl.textContent = 'Error al guardar: ' + e.message;
    btnGuardar.disabled = false;
  }
});

inicializar();