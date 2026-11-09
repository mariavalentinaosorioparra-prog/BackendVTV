document.addEventListener('DOMContentLoaded', function () {
  const URL_PHP = '../php/asignaciones.php';
  const form = document.getElementById('formAsignarRutina');
  const lista = document.getElementById('listaEjerciciosBanco');
  const panel = document.getElementById('panelAsignaciones');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCancelar = document.getElementById('btnCancelar');
  const inputCorreo = document.getElementById('correoUsuario');
  const selDia = document.getElementById('selectDia');
  let banco = [], asigs = [], editId = null;

  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Banco = ejercicios base + los del admin guardados en la BD
  function cargarBanco() {
    fetch('../php/Ejercicios.php?accion=listar').then(r => r.json())
      .then(d => {
        const extra = (d.ejercicios || []).map(x => ({
          id: 'c' + x.id, nombre: x.nombre, grupo: x.grupo,
          series: Number(x.series), reps: x.reps, tecnica: x.tecnica || ''
        }));
        banco = BANCO_EJERCICIOS_BASE.concat(extra);
      })
      .catch(() => { banco = BANCO_EJERCICIOS_BASE.slice(); })
      .then(() => pintarBanco([]));
  }

  function pintarBanco(marcados) {
    lista.innerHTML = banco.map(e =>
      '<label class="checkbox block has-text-white mb-2">' +
      '<input type="checkbox" name="ej" value="' + esc(e.id) + '"' + (marcados.includes(e.id) ? ' checked' : '') + ' class="mr-2">' +
      '<strong>' + esc(e.nombre) + '</strong> <span class="tag is-dark is-small ml-2">' + esc(GRUPOS[e.grupo] || e.grupo) + '</span></label>'
    ).join('');
  }

  // READ
  function cargarAsignaciones() {
    fetch(URL_PHP + '?accion=listar').then(r => r.json())
      .then(d => {
        asigs = (d.asignaciones || []).filter(a => a.tipo === 'rutina');
        pintarPanel();
      });
  }

  function pintarPanel() {
    const filas = asigs.map(a => {
      let n = 0; try { n = JSON.parse(a.contenido).length; } catch (e) {}
      return '<tr><td>' + esc(a.correo) + '</td><td>' + esc(a.dia) + '</td><td>' + n + ' ejercicios</td><td>' +
        '<button class="button is-small is-info is-light mr-2" data-edit="' + a.id + '">Editar</button>' +
        '<button class="button is-small is-danger is-light" data-del="' + a.id + '">Eliminar</button></td></tr>';
    }).join('');
    panel.innerHTML = '<h2 class="title is-5 has-text-white mb-3">Rutinas asignadas: ' + asigs.length + '</h2>' +
      '<table class="table is-fullwidth" style="background:transparent;color:#fff;"><tbody>' +
      (filas || '<tr><td>Aún no hay rutinas asignadas.</td></tr>') + '</tbody></table>';
  }

  // CREATE / UPDATE
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const ids = [...form.querySelectorAll('input[name=ej]:checked')].map(c => c.value);
    if (!ids.length) { mostrarAlerta('Selecciona al menos un ejercicio para la rutina.', 'warning'); return; }
    const contenido = banco.filter(b => ids.includes(b.id)).map(b => ({
      id: b.id, nombre: b.nombre, grupo: b.grupo, series: b.series, reps: b.reps, tecnica: b.tecnica
    }));

    const d = new FormData();
    d.append('accion', editId ? 'actualizar' : 'crear');
    if (editId) d.append('id', editId);
    d.append('correo', inputCorreo.value.trim());
    d.append('tipo', 'rutina');
    d.append('dia', selDia.value);
    d.append('contenido', JSON.stringify(contenido));

    fetch(URL_PHP, { method: 'POST', body: d }).then(r => r.json())
      .then(res => {
        mostrarAlerta(res.mensaje, res.ok ? 'success' : 'danger');
        if (res.ok) { salirEdicion(); cargarAsignaciones(); }
      })
      .catch(() => mostrarAlerta('No se pudo conectar con el servidor.', 'danger'));
  });

  function salirEdicion() {
    editId = null; form.reset(); inputCorreo.disabled = false;
    btnGuardar.textContent = 'Guardar y Asignar Rutina';
    btnCancelar.style.display = 'none';
    pintarBanco([]);
  }
  btnCancelar.addEventListener('click', salirEdicion);

  panel.addEventListener('click', function (e) {
    // DELETE
    const del = e.target.closest('[data-del]');
    if (del) {
      if (!confirm('¿Eliminar esta rutina asignada?')) return;
      const d = new FormData(); d.append('accion', 'eliminar'); d.append('id', del.dataset.del);
      fetch(URL_PHP, { method: 'POST', body: d }).then(r => r.json())
        .then(res => { mostrarAlerta(res.mensaje, res.ok ? 'success' : 'danger'); if (res.ok) cargarAsignaciones(); });
      return;
    }
    // cargar para editar
    const ed = e.target.closest('[data-edit]');
    if (ed) {
      const a = asigs.find(x => String(x.id) === ed.dataset.edit);
      if (!a) return;
      let ids = []; try { ids = JSON.parse(a.contenido).map(x => x.id); } catch (er) {}
      inputCorreo.value = a.correo; inputCorreo.disabled = true;
      selDia.value = a.dia;
      pintarBanco(ids);
      editId = a.id;
      btnGuardar.textContent = 'Guardar cambios';
      btnCancelar.style.display = '';
      form.scrollIntoView({ behavior: 'smooth' });
    }
  });

  cargarBanco();
  cargarAsignaciones();
});