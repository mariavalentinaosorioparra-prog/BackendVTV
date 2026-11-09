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
    llamarAPI(URL_PHP + '?accion=listar')
      .then(d => {
        filasBD = (esEj ? d.ejercicios : d.platos) || [];
        // Copia en localStorage para que el generador de rutinas/planes (datos.js) use estos items
        const cache = filasBD.map(x => esEj
          ? { id: 'c' + x.id, nombre: x.nombre, grupo: x.grupo, series: Number(x.series), reps: x.reps,
              impacto: x.impacto, enfoques: x.enfoques, compuesto: x.compuesto == 1, tecnica: x.tecnica || '',
              video: x.video || '' } // NUEVO: ruta del video
          : { id: 'c' + x.id_plan_nutricional, nombre: x.nombre, categoria: x.categoria, kcal: Number(x.calorias),
              p: Number(x.proteinas), c: Number(x.carbohidratos), g: Number(x.grasas),
              imc: x.imc || 'bnso', objetivos: x.objetivos || 'pgmt', modelo3d: x.modelo3d || '' });
        localStorage.setItem(claveExtra, JSON.stringify(cache));
        pintar();
      })
      .catch(err => mostrarAlerta(err.message, 'danger'));
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

  // Texto de detalle para los elementos BASE (vienen de datos.js)
  function detalle(x) {
    return esEj ? esc(GRUPOS[x.grupo] || x.grupo) + ' · ' + x.series + ' × ' + esc(x.reps)
                : esc(x.categoria) + ' · ' + x.kcal + ' kcal · P' + x.p + ' C' + x.c + ' G' + x.g;
  }
  // Texto de detalle para los elementos de la BD (columnas de la tabla)
  function enlaceArchivo(ruta, texto) {
    // La ruta guardada es relativa a la raíz del proyecto (uploads/...); las páginas viven en html/
    return ruta ? ' · <a href="../' + esc(ruta) + '" target="_blank" rel="noopener">' + texto + '</a>' : '';
  }
  function detalleBD(x) {
    return esEj ? esc(GRUPOS[x.grupo] || x.grupo) + ' · ' + x.series + ' × ' + esc(x.reps) + enlaceArchivo(x.video, '🎬 Ver video')
                : esc(x.categoria) + ' · ' + x.calorias + ' kcal · P' + x.proteinas + ' C' + x.carbohidratos + ' G' + x.grasas + enlaceArchivo(x.modelo3d, '📦 Ver archivo 3D');
  }

  // ---------- CREATE / UPDATE ----------
  form.addEventListener('submit', async function (e) {
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
      // NUEVO: video / GIF del ejercicio
      const video = form.querySelector('input[type=file]').files[0];
      if (video) d.append('video', video);
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
      if (archivo) d.append('modelo3d', archivo);
    }

    if (!d.get('nombre') || !sel) { mostrarAlerta('Completa el nombre y la categoría.', 'danger'); return; }

    const archivoSubido = d.get('video') || d.get('modelo3d');
    btnGuardar.disabled = true;
    btnGuardar.textContent = archivoSubido ? 'Subiendo archivo…' : 'Guardando…';
    try {
      const res = await llamarAPI(URL_PHP, { method: 'POST', body: d });

      // Si el archivo supera post_max_size, PHP descarta TODO el formulario y responde como si fuera
      // un "listar". Antes eso se mostraba como "Listo." sin haber guardado nada.
      if ('ejercicios' in res || 'platos' in res || 'ejercicio' in res) {
        throw new Error('El servidor no recibió el formulario: el archivo es más grande que el límite de PHP. ' +
          'Sube post_max_size y upload_max_filesize en php.ini (por ejemplo a 32M) y reinicia Apache.');
      }
      if (!res.ok) {
        let msg = res.mensaje || 'No se pudo guardar.';
        if (/código [12]\)/.test(msg)) msg += ' El archivo supera el límite de PHP (upload_max_filesize / post_max_size en php.ini).';
        throw new Error(msg);
      }

      mostrarAlerta(res.mensaje || 'Guardado.', 'success');
      salirEdicion();
      cargar();
    } catch (err) {
      mostrarAlerta(err.message, 'danger');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = editId ? 'Guardar cambios' : textoOriginal;
    }
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
      llamarAPI(URL_PHP, { method: 'POST', body: d })
        .then(res => { mostrarAlerta(res.mensaje, res.ok ? 'success' : 'danger'); if (res.ok) cargar(); })
        .catch(err => mostrarAlerta(err.message, 'danger'));
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