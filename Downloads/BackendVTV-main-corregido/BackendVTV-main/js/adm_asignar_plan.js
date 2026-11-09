document.addEventListener('DOMContentLoaded', function () {
  const URL_PHP = '../php/asignaciones.php';
  const form = document.getElementById('formAsignarPlan');
  const lista = document.getElementById('listaAlimentosBanco');
  const panel = document.getElementById('panelAsignaciones');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCancelar = document.getElementById('btnCancelar');
  const inputCorreo = document.getElementById('correoPlanUsuario');
  const inputKcal = document.getElementById('caloriasObjetivo');
  let banco = [], asigs = [], editId = null;

  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Banco = platos base + los del admin guardados en la BD
  function cargarBanco() {
    fetch('../php/plan_nutricional.php?accion=listar').then(r => r.json())
      .then(d => {
        const extra = (d.platos || []).filter(x => x.categoria).map(x => ({
          id: 'c' + x.id_plan_nutricional, nombre: x.nombre, categoria: x.categoria,
          kcal: Number(x.calorias), p: Number(x.proteinas), c: Number(x.carbohidratos), g: Number(x.grasas)
        }));
        banco = BANCO_ALIMENTOS_BASE.concat(extra);
      })
      .catch(() => { banco = BANCO_ALIMENTOS_BASE.slice(); })
      .then(() => pintarBanco([]));
  }

  function pintarBanco(marcados) {
    lista.innerHTML = banco.map(a =>
      '<label class="checkbox block has-text-white mb-2">' +
      '<input type="checkbox" name="al" value="' + esc(a.id) + '"' + (marcados.includes(a.id) ? ' checked' : '') + ' class="mr-2">' +
      '<strong>' + esc(a.nombre) + '</strong> <span class="tag is-info is-small ml-2">' + esc(a.categoria) + ' · ' + a.kcal + ' kcal</span></label>'
    ).join('');
  }

  // READ
  function cargarAsignaciones() {
    fetch(URL_PHP + '?accion=listar').then(r => r.json())
      .then(d => { asigs = (d.asignaciones || []).filter(a => a.tipo === 'plan'); pintarPanel(); });
  }

  function pintarPanel() {
    const filas = asigs.map(a => {
      let n = 0; try { n = JSON.parse(a.contenido).length; } catch (e) {}
      return '<tr><td>' + esc(a.correo) + '</td><td>' + a.calorias + ' kcal</td><td>' + n + ' platos</td><td>' +
        '<button class="button is-small is-info is-light mr-2" data-edit="' + a.id + '">Editar</button>' +
        '<button class="button is-small is-danger is-light" data-del="' + a.id + '">Eliminar</button></td></tr>';
    }).join('');
    panel.innerHTML = '<h2 class="title is-5 has-text-white mb-3">Planes asignados: ' + asigs.length + '</h2>' +
      '<table class="table is-fullwidth" style="background:transparent;color:#fff;"><tbody>' +
      (filas || '<tr><td>Aún no hay planes asignados.</td></tr>') + '</tbody></table>';
  }

  // CREATE / UPDATE
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const ids = [...form.querySelectorAll('input[name=al]:checked')].map(c => c.value);
    if (!ids.length) { mostrarAlerta('Selecciona al menos un alimento para el plan.', 'warning'); return; }
    const contenido = banco.filter(b => ids.includes(b.id)).map(b => ({
      id: b.id, nombre: b.nombre, categoria: b.categoria, kcal: b.kcal, p: b.p, c: b.c, g: b.g
    }));

    const d = new FormData();
    d.append('accion', editId ? 'actualizar' : 'crear');
    if (editId) d.append('id', editId);
    d.append('correo', inputCorreo.value.trim());
    d.append('tipo', 'plan');
    d.append('dia', '');
    d.append('calorias', inputKcal.value);
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
    btnGuardar.textContent = 'Guardar y Asignar Plan';
    btnCancelar.style.display = 'none';
    pintarBanco([]);
  }
  btnCancelar.addEventListener('click', salirEdicion);

  panel.addEventListener('click', function (e) {
    // DELETE
    const del = e.target.closest('[data-del]');
    if (del) {
      if (!confirm('¿Eliminar este plan asignado?')) return;
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
      inputKcal.value = a.calorias;
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