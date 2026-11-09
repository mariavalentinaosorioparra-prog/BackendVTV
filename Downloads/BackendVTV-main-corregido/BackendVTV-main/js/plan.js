(function () {
  const cont = document.getElementById('contenido');
  const p = obtenerPerfil();
  if (!p) { cont.innerHTML = vacio('Aún no tenemos tu valoración inicial, así que no podemos calcular tu plan nutricional.'); return; }

  // Si el admin te asignó un plan se usa ese; si no, se calcula automático (ver seguimiento.js)
  Seguimiento.obtenerPlan(p).then(iniciar);

  function iniciar(plan) {
    const NOMBRE_COMIDA = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', snack: 'Snack' };
    const hoy = Seguimiento.indiceHoy();      // solo se pueden marcar las comidas del día de hoy
    let actual = hoy;
    let hechas = Seguimiento.leerComidas();

    document.getElementById('resumen').innerHTML =
      '<span class="tag is-success is-light is-rounded">' + esc(OBJ_TXT[plan.objetivo] || plan.objetivo) + '</span> ' +
      '<span class="tag is-info is-light is-rounded">IMC ' + p.imc.toFixed(1) + ' · ' + IMC_TXT[p.catIMC] + '</span>';

    const stat = (n, e) => '<div class="column is-3 is-6-mobile"><div class="box glass-box stat"><div class="num">' + n + '</div><div class="etq">' + e + '</div></div></div>';
    const metas = document.getElementById('metas');
    metas.innerHTML =
      (plan.aviso ? '<div class="aviso">' + esc(plan.aviso) + '</div>' : '') +
      '<div class="columns is-multiline is-mobile">' +
      stat(plan.kcal + ' kcal', 'Meta diaria') + stat(plan.prot + ' g', 'Proteína') +
      stat(plan.carb + ' g', 'Carbohidratos') + stat(plan.gras + ' g', 'Grasas') + '</div>';

    function pintar() {
      const d = plan.dias[actual];
      const esHoy = actual === hoy;
      const tabs = plan.dias.map((x, i) => '<button class="dia-tab' + (i === actual ? ' activo' : '') + '" data-i="' + i + '">' + x.nombre + (i === hoy ? ' (hoy)' : '') + '</button>').join('');
      const cards = d.comidas.map((m, idx) => {
        const ok = !!hechas[d.nombre + ':' + m.categoria];
        return '<div class="comida-card' + (ok ? ' hecho' : '') + '"><div class="level is-mobile mb-1"><strong>' + NOMBRE_COMIDA[m.categoria] + '</strong>' +
          '<span class="tag is-rounded">' + m.kcal + ' kcal</span></div>' +
          '<div>' + esc(m.nombre) + '</div>' +
          '<p>Porción ' + m.porcion + '× · P ' + m.p + ' g · C ' + m.c + ' g · G ' + m.g + ' g</p>' +
          '<label class="checkbox mt-2"' + (esHoy ? '' : ' title="Solo puedes marcar las comidas de hoy"') + '><input type="checkbox" data-m="' + idx + '"' +
          (ok ? ' checked' : '') + (esHoy ? '' : ' disabled') + '> ' + (ok ? 'Comida registrada' : 'Ya la comí') + '</label></div>';
      }).join('');

      const t = Seguimiento.deHoy();
      const consumido = esHoy
        ? '<p class="is-size-7 mt-1">Consumido hoy: <strong>' + t.c + ' de ' + plan.kcal + ' kcal</strong></p>'
        : '';
      cont.innerHTML = '<div class="dia-tabs">' + tabs + '</div><div class="box glass-box">' + cards +
        '<p class="is-size-7 mt-3">Total del día: <strong>' + d.total.kcal + ' kcal</strong> · P ' + d.total.p + ' g · C ' + d.total.c + ' g · G ' + d.total.g + ' g</p>' +
        consumido + '</div>';
    }

    cont.addEventListener('click', e => {
      const t = e.target.closest('.dia-tab');
      if (t) { actual = Number(t.dataset.i); pintar(); }
    });
    cont.addEventListener('change', e => {
      if (e.target.dataset.m === undefined || actual !== hoy) return;
      const dia = plan.dias[actual], comida = dia.comidas[Number(e.target.dataset.m)];
      if (!comida) return;
      // Guarda la comida, suma calorías y macros de hoy y actualiza Progreso
      Seguimiento.marcarComida(dia.nombre, comida, e.target.checked);
      hechas = Seguimiento.leerComidas();
      pintar();
    });
    pintar();
  }
})();

document.getElementById('formSugerencia')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const mensaje = document.getElementById('mensajeSugerencia').value.trim();

  if (!mensaje) {
    if (typeof mostrarAlerta === 'function') mostrarAlerta("Escribe una descripción en el mensaje.", "danger");
    return;
  }

  const datos = new FormData();
  datos.append('accion', 'crear');
  datos.append('mensaje', mensaje);

  fetch('../php/sugerencias.php', { method: 'POST', body: datos })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        if (typeof mostrarAlerta === 'function') mostrarAlerta(data.mensaje, "success");
        document.getElementById('mensajeSugerencia').value = '';
      } else {
        if (typeof mostrarAlerta === 'function') mostrarAlerta(data.mensaje, "danger");
      }
    })
    .catch(err => console.error('Error:', err));
});