/* Admin: alta de ejercicios / alimentos y listado del banco (base + propios) */
(function () {
  const form = document.querySelector('form');
  if (!form) return;
  const esEj = document.title.indexOf('Ejercicios') !== -1;
  const claveExtra = esEj ? 'bancoEjerciciosExtra' : 'bancoAlimentosExtra';
  const letras = (cbs, cods) => cods.filter((c, i) => cbs[i] && cbs[i].checked).join('');

  const panel = document.createElement('div');
  panel.className = 'box glass-box mt-5';
  form.closest('.glass-box').after(panel);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const txt = form.querySelectorAll('input[type=text]');
    const num = form.querySelectorAll('input[type=number]');
    const cbs = form.querySelectorAll('input[type=checkbox]');
    const sel = form.querySelector('select').value;
    let item;
    if (esEj) {
      item = {
        nombre: txt[0].value.trim(), grupo: sel, series: Number(num[0].value) || 3, reps: txt[1].value.trim() || '10-12',
        impacto: letras([cbs[0], cbs[1], cbs[2]], ['b', 'm', 'a']) || 'bma',
        enfoques: letras([cbs[3], cbs[4], cbs[5]], ['p', 'h', 'f']) || 'phf',
        compuesto: false, tecnica: (form.querySelector('textarea').value || '').trim()
      };
    } else {
      item = {
        nombre: txt[0].value.trim(), categoria: sel, kcal: Number(num[0].value) || 0,
        p: Number(num[1].value) || 0, c: Number(num[2].value) || 0, g: Number(num[3].value) || 0,
        imc: letras([cbs[0], cbs[1], cbs[2], cbs[3]], ['b', 'n', 's', 'o']) || 'bnso',
        objetivos: letras([cbs[4], cbs[5], cbs[6], cbs[7]], ['p', 'g', 'm', 't']) || 'pgmt'
      };
    }
    if (!item.nombre || !item.grupo && esEj || !item.categoria && !esEj) { mostrarAlerta('Completa el nombre y la categoría.', 'danger'); return; }
    item.id = 'c' + Date.now();
    const extra = leerExtra(claveExtra); extra.push(item);
    localStorage.setItem(claveExtra, JSON.stringify(extra));
    form.reset();
    mostrarAlerta('Guardado en el banco. Se usará en las próximas asignaciones.', 'success');
    pintar();
  });

  panel.addEventListener('click', function (e) {
    const b = e.target.closest('[data-del]');
    if (!b) return;
    if (!confirm('¿Eliminar este elemento del banco?')) return;
    localStorage.setItem(claveExtra, JSON.stringify(leerExtra(claveExtra).filter(x => x.id !== b.dataset.del)));
    pintar();
  });

  function pintar() {
    const todos = esEj ? getEjercicios() : getAlimentos();
    const filas = todos.map(x => {
      const det = esEj
        ? esc(GRUPOS[x.grupo] || x.grupo) + ' · ' + x.series + ' × ' + esc(x.reps)
        : esc(x.categoria) + ' · ' + x.kcal + ' kcal · P' + x.p + ' C' + x.c + ' G' + x.g;
      return '<tr><td>' + esc(x.nombre) + '</td><td>' + det + '</td><td>' +
        (x.base ? '<span class="tag is-light">Base</span>' : '<button class="button is-small is-danger is-light" data-del="' + esc(x.id) + '">Eliminar</button>') + '</td></tr>';
    }).join('');
    panel.innerHTML = '<h2 class="title is-5 mb-3">En el banco: ' + todos.length + ' ' + (esEj ? 'ejercicios' : 'platos') + '</h2>' +
      '<div class="lista-scroll"><table class="table tabla-banco"><tbody>' + filas + '</tbody></table></div>';
  }
  pintar();
})();
