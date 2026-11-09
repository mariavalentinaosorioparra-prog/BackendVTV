(function () {
  const cont = document.getElementById('contenido');
  const p = obtenerPerfil();
  if (!p) { cont.innerHTML = vacio('Aún no tenemos tu valoración inicial, así que no podemos armar tu rutina.'); return; }

  // Si el admin te asignó una rutina se usa esa; si no, se genera automática (ver seguimiento.js)
  Seguimiento.obtenerRutina(p).then(iniciar);

  function iniciar(r) {
    let hechos = Seguimiento.leerHechos();
    const impactoTxt = r.permit.includes('a') ? 'Todos los niveles de impacto' : r.permit.includes('m') ? 'Impacto bajo y moderado' : 'Solo bajo impacto';
    let actual = 0;

    document.getElementById('resumen').innerHTML =
      '<span class="tag is-success is-light is-rounded">' + esc(OBJ_TXT[p.objetivo] || p.objetivo) + '</span> ' +
      '<span class="tag is-info is-light is-rounded">IMC ' + p.imc.toFixed(1) + ' · ' + IMC_TXT[p.catIMC] + '</span> ' +
      '<span class="tag is-warning is-light is-rounded">' + (NIVEL_TXT[p.nivel] || p.nivel) + '</span> ' +
      '<span class="tag is-light is-rounded">' + r.dias.length + ' días por semana · ' + impactoTxt + '</span>';

    function pintar() {
      const d = r.dias[actual];
      const estados = Seguimiento.estadoDias(r);
      const tabs = r.dias.map((x, i) =>
        '<button class="dia-tab' + (i === actual ? ' activo' : '') + (estados[i].estado === 'completado' ? ' completo' : '') + '" data-i="' + i + '">' +
        (estados[i].estado === 'completado' ? '✓ ' : '') + 'Día ' + (i + 1) + ' · ' + esc(x.nombre) + '</button>').join('');
      const total = d.ejercicios.length;
      const listos = d.ejercicios.filter(e => hechos[actual + ':' + e.id]).length;
      const cards = d.ejercicios.map((e, idx) => {
        const k = actual + ':' + e.id, ok = !!hechos[k];
        const dosis = e.series > 1 ? e.series + ' series × ' + e.reps : e.reps;
        return '<div class="ej-card' + (ok ? ' hecho' : '') + '">' +
          '<label class="checkbox"><input type="checkbox" data-k="' + esc(k) + '" data-ej="' + idx + '"' + (ok ? ' checked' : '') + '> <strong>' + esc(e.nombre) + '</strong></label>' +
          '<div class="tags mt-2"><span class="tag is-rounded">' + esc(GRUPOS[e.grupo] || e.grupo) + '</span>' +
          '<span class="tag is-rounded">' + esc(dosis) + '</span>' +
          (e.descanso ? '<span class="tag is-rounded">Descanso ' + e.descanso + ' s</span>' : '') +
          '<span class="tag is-rounded">≈ ' + Seguimiento.kcalEjercicio(e, p.peso) + ' kcal</span></div>' +
          '<p>' + esc(e.tecnica || '') + '</p></div>';
      }).join('');
      cont.innerHTML = '<div class="dia-tabs">' + tabs + '</div>' +
        '<div class="box glass-box"><div class="level is-mobile mb-3"><h2 class="title is-5 m-0">' + esc(d.nombre) + '</h2>' +
        '<span class="is-size-7">' + (listos === total && total ? '¡Día completado! · ' : '') + listos + ' de ' + total + ' hechos</span></div>' +
        '<progress class="progress is-success mb-4" value="' + listos + '" max="' + (total || 1) + '"></progress>' + cards + '</div>';
    }

    cont.addEventListener('click', e => {
      const t = e.target.closest('.dia-tab');
      if (t) { actual = Number(t.dataset.i); pintar(); }
    });
    cont.addEventListener('change', e => {
      if (e.target.dataset.ej === undefined) return;
      const ejercicio = r.dias[actual].ejercicios[Number(e.target.dataset.ej)];
      if (!ejercicio) return;
      // Guarda el avance, suma (o resta) las calorías y actualiza calendario y progreso
      Seguimiento.marcarEjercicio(actual, ejercicio, e.target.checked, p.peso);
      hechos = Seguimiento.leerHechos();
      pintar();
    });
    pintar();
  }
})();
