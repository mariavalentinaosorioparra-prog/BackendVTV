document.addEventListener('DOMContentLoaded', function () {
  const nombre = document.getElementById('nombreAdmin');
  if (nombre && localStorage.getItem('usuarioNombre')) nombre.textContent = localStorage.getItem('usuarioNombre');
  const btn = document.getElementById('btnCerrarSesion');
  if (btn) btn.addEventListener('click', function () {
    if (confirm('¿Cerrar sesión?')) { sessionStorage.clear(); window.location.href = 'login.html'; }
  });
});
