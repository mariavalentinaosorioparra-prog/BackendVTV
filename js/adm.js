document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Validar seguridad: Sesión iniciada, rol de admin y dominio @fitapp.com
  const sesionIniciada = sessionStorage.getItem('sesionIniciada');
  const esAdmin = localStorage.getItem('esAdmin') === 'true';
  const correoActivo = localStorage.getItem('usuarioActivo') || '';

  if (sesionIniciada !== 'true' || !esAdmin || !correoActivo.endsWith('@fitapp.com')) {
    mostrarAlerta("Acceso denegado. Área exclusiva para administradores.", "danger");
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  // 2. Mostrar el nombre del Administrador dinámicamente
  const nombreAdminElem = document.getElementById('nombreAdmin');
  if (nombreAdminElem) {
    // Si hay un nombre guardado en localStorage, lo usa; si no, extrae el nombre del correo (ej: admin@fitapp.com -> Admin)
    const nombreGuardado = localStorage.getItem('usuarioNombre');
    if (nombreGuardado) {
      nombreAdminElem.innerText = nombreGuardado;
    } else {
      const aliasCorreo = correoActivo.split('@')[0];
      nombreAdminElem.innerText = aliasCorreo.charAt(0).toUpperCase() + aliasCorreo.slice(1);
    }
  }

  // 3. Configurar el botón de Cerrar Sesión
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function() {
      // Usamos mostrarConfirmacion si existe en alertas.js, o un confirm nativo por seguridad
      if (typeof mostrarConfirmacion === 'function') {
        mostrarConfirmacion("¿Estás seguro de que deseas cerrar la sesión de administrador?", function() {
          ejecutarCierreSesion();
        });
      } else {
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
          ejecutarCierreSesion();
        }
      }
    });
  }

});

function ejecutarCierreSesion() {
  sessionStorage.removeItem('sesionIniciada');
  localStorage.removeItem('usuarioActivo');
  localStorage.removeItem('esAdmin');

  if (typeof mostrarAlerta === 'function') {
    mostrarAlerta("Sesión cerrada correctamente.", "success");
  }
  
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}