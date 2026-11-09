
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

document.addEventListener('DOMContentLoaded', function () {
  const nombre = document.getElementById('nombreAdmin');
  if (nombre && localStorage.getItem('usuarioNombre')) nombre.textContent = localStorage.getItem('usuarioNombre');
  const btn = document.getElementById('btnCerrarSesion');
  if (btn) btn.addEventListener('click', function () {
    if (confirm('¿Cerrar sesión?')) { sessionStorage.clear(); window.location.href = 'login.html'; }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const contenedor = document.getElementById('contenedorBuzonSugerencias');
  if (!contenedor) return;

  fetch('../php/sugerencias.php?accion=listar')
    .then(res => res.json())
    .then(data => {
      if (!data.ok || data.sugerencias.length === 0) {
        contenedor.innerHTML = '<p class="is-size-7 has-text-grey">No hay solicitudes ni restricciones pendientes.</p>';
        return;
      }

      let html = '<div class="table-container"><table class="table is-fullwidth is-striped is-hoverable is-dark" style="background:transparent; color: #fff;">';
      html += '<thead><tr><th style="color:#fff;">Usuario</th><th style="color:#fff;">Correo</th><th style="color:#fff;">Necesidad / Restricción</th><th style="color:#fff;">Fecha</th></tr></thead><tbody>';

      data.sugerencias.forEach(s => {
        html += `<tr>
          <td><strong>${s.nombre}</strong></td>
          <td>${s.correo}</td>
          <td><span class="tag is-warning is-light">${s.mensaje}</span></td>
          <td>${s.fecha}</td>
        </tr>`;
      });

      html += '</tbody></table></div>';
      contenedor.innerHTML = html;
    })
    .catch(err => console.error('Error cargando sugerencias:', err));
});