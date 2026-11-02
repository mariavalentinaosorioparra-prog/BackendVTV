/* Admin: CRUD del banco de ejercicios / alimentos conectado a la BD */
(function () {
  const form = document.querySelector('form');
  if (!form) return;
  const esEj = document.title.indexOf('Ejercicios') !== -1;
  const URL_PHP = esEj ? '../php/Ejercicios.php' : '../php/plan_nutricional.php';
  const claveExtra = esEj ? 'bancoEjerciciosExtra' : 'bancoAlimentosExtra';
  const btnGuardar = form.querySelector('button[type=submit]');
  const textoOriginal = btnGuardar.textContent;
  let editId = null;      // null = creando, número = editando
  let filasBD = [];       // lo que hay en la BD

  const letras = (cbs, cods) => cods.filter((c, i) => cbs[i] && cbs[i].checked).join('');
  const marcar = (cbs, cods, valor) => cods.forEach((c, i) => { if (cbs[i]) cbs[i].checked = (valor || '').includes(c); });

  const panel = document.createElement('div');
  panel.className = 'box glass-box mt-5';
  form.closest('.glass-box').after(panel);

  // ---------- READ ----------
  function cargar() {
    fetch(URL_PHP + '?accion=listar')
      .then(r => r.json())
      .then(d => {
        filasBD = (esEj ? d.ejercicios : d.platos) || [];
        // Copia en localStorage para que el generador de rutinas/planes (datos.js) use estos items
        const cache = filasBD.map(x => esEj
          ? { id: 'c' + x.id, nombre: x.nombre, grupo: x.grupo, series: Number(x.series), reps: x.reps,
              impacto: x.impacto, enfoques: x.enfoques, compuesto: x.compuesto == 1, tecnica: x.tecnica || '' }
          : { id: 'c' + x.id_plan_nutricional, nombre: x.nombre, categoria: x.categoria, kcal: Number(x.calorias),
              p: Number(x.proteinas), c: Number(x.carbohidratos), g: Number(x.grasas),
              imc: x.imc || 'bnso', objetivos: x.objetivos || 'pgmt' });
        localStorage.setItem(claveExtra, JSON.stringify(cache));
        pintar();
      })
      .catch(() => mostrarAlerta('No se pudo cargar el banco desde el servidor.', 'danger'));
  }

  function pintar() {
    const base = esEj ? BANCO_EJERCICIOS_BASE : BANCO_ALIMENTOS_BASE;
    const filasBase = base.map(x => '<tr><td>' + esc(x.nombre) + '</td><td>' + detalle(x) +
      '</td><td><span class="tag is-light">Base</span></td></tr>').join('');
    const filasDB = filasBD.map(x => {
      const id = esEj ? x.id : x.id_plan_nutricional;
      return '<tr><td>' + esc(x.nombre) + '</td><td>' + detalleBD(x) + '</td><td>' +
        '<button class="button is-small is-info is-light mr-2" data-edit="' + id + '">Editar</button>' +
        '<button class="button is-small is-danger is-light" data-del="' + id + '">Eliminar</button></td></tr>';
    }).join('');
    panel.innerHTML = '<h2 class="title is-5 mb-3">Agregados por el admin: ' + filasBD.length + '</h2>' +
      '<div class="lista-scroll"><table class="table tabla-banco"><tbody>' + (filasDB || '<tr><td>Aún no hay elementos propios.</td></tr>') + '</tbody></table></div>' +
      '<h2 class="title is-6 mt-4 mb-3">Banco base: ' + base.length + '</h2>' +
      '<div class="lista-scroll"><table class="table tabla-banco"><tbody>' + filasBase + '</tbody></table></div>';
  }

  function detalle(x) {
    return esEj ? esc(GRUPOS[x.grupo] || x.grupo) + ' · ' + x.series + ' × ' + esc(x.reps)
                : esc(x.categoria) + ' · ' + x.kcal + ' kcal · P' + x.p + ' C' + x.c + ' G' + x.g;
  }
  function detalleBD(x) {
    return esEj ? esc(GRUPOS[x.grupo] || x.grupo) + ' · ' + x.series + ' × ' + esc(x.reps)
                : esc(x.categoria) + ' · ' + x.calorias + ' kcal · P' + x.proteinas + ' C' + x.carbohidratos + ' G' + x.grasas;
  }

  // ---------- CREATE / UPDATE ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const txt = form.querySelectorAll('input[type=text]');
    const num = form.querySelectorAll('input[type=number]');
    const cbs = form.querySelectorAll('input[type=checkbox]');
    const sel = form.querySelector('select').value;
    const d = new FormData();
    d.append('accion', editId ? 'actualizar' : 'crear');
    if (editId) d.append('id', editId);

    if (esEj) {
      d.append('nombre', txt[0].value.trim());
      d.append('grupo', sel);
      d.append('series', Number(num[0].value) || 3);
      d.append('reps', txt[1].value.trim() || '10-12');
      d.append('impacto', letras([cbs[0], cbs[1], cbs[2]], ['b', 'm', 'a']) || 'bma');
      d.append('enfoques', letras([cbs[3], cbs[4], cbs[5]], ['p', 'h', 'f']) || 'phf');
      d.append('compuesto', 0);
      d.append('tecnica', (form.querySelector('textarea').value || '').trim());
    } else {
      d.append('nombre', txt[0].value.trim());
      d.append('categoria', sel);
      d.append('calorias', Number(num[0].value) || 0);
      d.append('proteinas', Number(num[1].value) || 0);
      d.append('carbohidratos', Number(num[2].value) || 0);
      d.append('grasas', Number(num[3].value) || 0);
      d.append('imc', letras([cbs[0], cbs[1], cbs[2], cbs[3]], ['b', 'n', 's', 'o']) || 'bnso');
      d.append('objetivos', letras([cbs[4], cbs[5], cbs[6], cbs[7]], ['p', 'g', 'm', 't']) || 'pgmt');
      const archivo = form.querySelector('input[type=file]').files[0];
      if (archivo && !editId) d.append('modelo3d', archivo);
    }

    if (!d.get('nombre') || !sel) { mostrarAlerta('Completa el nombre y la categoría.', 'danger'); return; }

    fetch(URL_PHP, { method: 'POST', body: d })
      .then(r => r.json())
      .then(res => {
        mostrarAlerta(res.mensaje || (res.ok ? 'Listo.' : 'Error.'), res.ok ? 'success' : 'danger');
        if (res.ok) { salirEdicion(); cargar(); }
      })
      .catch(() => mostrarAlerta('No se pudo conectar con el servidor.', 'danger'));
  });

  function salirEdicion() {
    editId = null;
    form.reset();
    btnGuardar.textContent = textoOriginal;
  }

  panel.addEventListener('click', function (e) {
    // ---------- DELETE ----------
    const del = e.target.closest('[data-del]');
    if (del) {
      if (!confirm('¿Eliminar este elemento del banco?')) return;
      const d = new FormData();
      d.append('accion', 'eliminar');
      d.append('id', del.dataset.del);
      fetch(URL_PHP, { method: 'POST', body: d })
        .then(r => r.json())
        .then(res => { mostrarAlerta(res.mensaje, res.ok ? 'success' : 'danger'); if (res.ok) cargar(); });
      return;
    }
    // ---------- cargar en el formulario para editar ----------
    const ed = e.target.closest('[data-edit]');
    if (ed) {
      const x = filasBD.find(f => String(esEj ? f.id : f.id_plan_nutricional) === ed.dataset.edit);
      if (!x) return;
      const txt = form.querySelectorAll('input[type=text]');
      const num = form.querySelectorAll('input[type=number]');
      const cbs = form.querySelectorAll('input[type=checkbox]');
      txt[0].value = x.nombre;
      if (esEj) {
        form.querySelector('select').value = x.grupo;
        num[0].value = x.series;
        txt[1].value = x.reps;
        marcar([cbs[0], cbs[1], cbs[2]], ['b', 'm', 'a'], x.impacto);
        marcar([cbs[3], cbs[4], cbs[5]], ['p', 'h', 'f'], x.enfoques);
        form.querySelector('textarea').value = x.tecnica || '';
      } else {
        form.querySelector('select').value = x.categoria;
        num[0].value = x.calorias; num[1].value = x.proteinas;
        num[2].value = x.carbohidratos; num[3].value = x.grasas;
        marcar([cbs[0], cbs[1], cbs[2], cbs[3]], ['b', 'n', 's', 'o'], x.imc);
        marcar([cbs[4], cbs[5], cbs[6], cbs[7]], ['p', 'g', 'm', 't'], x.objetivos);
      }
      editId = ed.dataset.edit;
      btnGuardar.textContent = 'Guardar cambios';
      form.scrollIntoView({ behavior: 'smooth' });
    }
  });

  cargar();
})();