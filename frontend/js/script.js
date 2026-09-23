// Cambia esta URL por la IP de tu VM cuando la abras desde Windows
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000'
  : `http://${window.location.hostname}:4000`;

document.getElementById('btn-test').addEventListener('click', async () => {
  const resultado = document.getElementById('resultado');
  resultado.textContent = 'Consultando...';

  try {
    const res = await fetch(`${API_URL}/api/test`);
    const data = await res.json();
    resultado.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    resultado.textContent = 'Error: ' + error.message;
    console.error(error);
  }
});