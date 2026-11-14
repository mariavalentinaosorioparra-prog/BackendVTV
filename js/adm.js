
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

/* ============================================================
   CAJÓN DE SUGERENCIAS (administrador)
   Recibe lo que los usuarios envían desde Rutinas / Plan nutricional,
   permite filtrarlo, responder (marca como revisado) y eliminar.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const lista = document.getElementById('listaSugerenciasAdm');
  if (!lista) return;
  if (typeof llamarAPI !== 'function') {
    lista.innerHTML = '<p class="has-text-danger">Falta cargar ../js/api.js en adm.html (antes de adm.js).</p>';
    return;
  }

  const URL_SUG = '../php/sugerencias.php';
  const MAX = 1000;
  const TIPO_TXT = { alergia: 'Alergia / intolerancia', discapacidad: 'Discapacidad', lesion: 'Lesión', condicion: 'Condición médica', otro: 'Otro' };
  const DEST_TXT = { entrenador: 'Entrenador', nutriologo: 'Nutriólogo', ambos: 'Entrenador y nutriólogo' };
  const filtroDirigido = document.getElementById('filtroDirigido');
  const filtroEstado = document.getElementById('filtroEstado');
  const badge = document.getElementById('badgePendientes');
  const btnRecargar = document.getElementById('btnRecargarSug');

  const escS = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const avisar = (texto, tipo) => (typeof mostrarAlerta === 'function') ? mostrarAlerta(escS(texto), tipo) : alert(texto);

  async function cargar() {
    const params = new URLSearchParams({ accion: 'listar' });
    if (filtroDirigido && filtroDirigido.value) params.append('dirigido', filtroDirigido.value);
    if (filtroEstado && filtroEstado.value) params.append('estado', filtroEstado.value);
    try {
      const r = await llamarAPI(URL_SUG + '?' + params.toString());
      if (!r.ok) { lista.innerHTML = '<p class="has-text-danger">' + escS(r.mensaje) + '</p>'; return; }

      if (badge) {
        badge.textContent = r.pendientes + (r.pendientes === 1 ? ' pendiente' : ' pendientes');
        badge.hidden = !r.pendientes;
      }
      if (!r.sugerencias.length) {
        lista.innerHTML = '<p class="has-text-grey-light">No hay reportes con este filtro.</p>';
        return;
      }
      lista.innerHTML = r.sugerencias.map(pintarTarjeta).join('');
    } catch (err) {
      lista.innerHTML = '<p class="has-text-danger">' + escS(err.message) + '</p>';
    }
  }

  function pintarTarjeta(s) {
    const revisado = s.estado === 'revisado';
    const zonaRespuesta = revisado
      ? (s.respuesta ? '<div class="sug-respuesta"><strong>Tu respuesta</strong> (' + escS(s.fecha_respuesta || '') + '): ' + escS(s.respuesta) + '</div>' : '')
      : '<form class="form-responder mt-3" data-id="' + s.id + '" novalidate>' +
          '<textarea class="textarea is-small" name="respuesta" rows="2" maxlength="' + MAX + '" placeholder="Escribe la respuesta para el usuario…"></textarea>' +
          '<p class="help has-text-grey-light has-text-right contador-resp">0 / ' + MAX + '</p>' +
          '<p class="help is-danger error-resp" hidden>La respuesta no puede quedar vacía.</p>' +
          '<button type="submit" class="button is-small is-success is-rounded mt-1">Responder y marcar revisado</button>' +
        '</form>';

    return '<div class="sug-card' + (revisado ? '' : ' pendiente') + '">' +
      '<div class="level is-mobile mb-2">' +
        '<div class="level-left"><strong>' + escS(s.correo) + '</strong></div>' +
        '<div class="level-right"><button type="button" class="button is-small is-danger is-light is-rounded" data-borrar="' + s.id + '">Eliminar</button></div>' +
      '</div>' +
      '<div class="tags mb-2">' +
        '<span class="tag is-rounded">' + escS(TIPO_TXT[s.tipo] || s.tipo) + '</span>' +
        '<span class="tag is-rounded">Para: ' + escS(DEST_TXT[s.dirigido_a] || s.dirigido_a) + '</span>' +
        '<span class="tag is-rounded ' + (revisado ? 'is-success' : 'is-warning') + ' is-light">' + (revisado ? 'Revisado' : 'Pendiente') + '</span>' +
        '<span class="tag is-rounded is-dark">' + escS(s.fecha) + '</span>' +
      '</div>' +
      '<p>' + escS(s.descripcion) + '</p>' +
      zonaRespuesta +
    '</div>';
  }

  // Contador y quitar el error mientras se escribe la respuesta
  lista.addEventListener('input', e => {
    if (e.target.name !== 'respuesta') return;
    const f = e.target.closest('form');
    f.querySelector('.contador-resp').textContent = e.target.value.length + ' / ' + MAX;
    if (e.target.value.trim()) {
      e.target.classList.remove('is-danger');
      f.querySelector('.error-resp').hidden = true;
    }
  });

  // Responder (valida que no quede vacío)
  lista.addEventListener('submit', async e => {
    const f = e.target.closest('.form-responder');
    if (!f) return;
    e.preventDefault();
    const area = f.querySelector('textarea[name="respuesta"]');
    const error = f.querySelector('.error-resp');
    const texto = area.value.trim();

    if (!texto || texto.length > MAX) {
      error.textContent = !texto ? 'La respuesta no puede quedar vacía.' : 'La respuesta no puede pasar de ' + MAX + ' caracteres.';
      error.hidden = false;
      area.classList.add('is-danger');
      area.focus();
      return;
    }

    const btn = f.querySelector('button[type="submit"]');
    btn.disabled = true; btn.classList.add('is-loading');
    const fd = new FormData();
    fd.append('accion', 'responder');
    fd.append('id', f.dataset.id);
    fd.append('respuesta', texto);
    try {
      const r = await llamarAPI(URL_SUG, { method: 'POST', body: fd });
      avisar(r.mensaje, r.ok ? 'success' : 'danger');
      if (r.ok) cargar();
    } catch (err) {
      avisar(err.message, 'danger');
    } finally {
      btn.disabled = false; btn.classList.remove('is-loading');
    }
  });

  // Eliminar
  lista.addEventListener('click', async e => {
    const b = e.target.closest('[data-borrar]');
    if (!b || !confirm('¿Eliminar este reporte?')) return;
    const fd = new FormData();
    fd.append('accion', 'eliminar');
    fd.append('id', b.dataset.borrar);
    try {
      const r = await llamarAPI(URL_SUG, { method: 'POST', body: fd });
      avisar(r.mensaje, r.ok ? 'success' : 'danger');
      if (r.ok) cargar();
    } catch (err) { avisar(err.message, 'danger'); }
  });

  if (filtroDirigido) filtroDirigido.addEventListener('change', cargar);
  if (filtroEstado) filtroEstado.addEventListener('change', cargar);
  if (btnRecargar) btnRecargar.addEventListener('click', cargar);

  // Revisa cada 30 s si llegaron reportes nuevos (sin borrar una respuesta que se esté escribiendo)
  setInterval(() => {
    const escribiendo = [...lista.querySelectorAll('textarea[name="respuesta"]')].some(t => t.value.trim());
    if (!escribiendo) cargar();
  }, 30000);

  cargar();
});
