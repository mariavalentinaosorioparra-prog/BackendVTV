<<<<<<< HEAD
// Cuando el usuario presiona el botón de finalizar rutina:
const caloriasDelEjercicio = 350; // Ejemplo de calorías estimadas de la rutina
registrarEjercicioCompletado(caloriasDelEjercicio);

mostrarAlerta("¡Rutina completada! Tus calorías quemadas se han sumado al progreso.", "success");
=======
(function () {
  const cont = document.getElementById('contenido');
  const p = obtenerPerfil();
  if (!p) { cont.innerHTML = vacio('Aún no tenemos tu valoración inicial, así que no podemos armar tu rutina.'); return; }

  const r = generarRutina(p);
  const hechos = (() => { try { return JSON.parse(localStorage.getItem('rutinaHechos')) || {}; } catch (e) { return {}; } })();
  const impactoTxt = r.permit.includes('a') ? 'Todos los niveles de impacto' : r.permit.includes('m') ? 'Impacto bajo y moderado' : 'Solo bajo impacto';
  let actual = 0;

  document.getElementById('resumen').innerHTML =
    '<span class="tag is-success is-light is-rounded">' + esc(OBJ_TXT[p.objetivo] || p.objetivo) + '</span> ' +
    '<span class="tag is-info is-light is-rounded">IMC ' + p.imc.toFixed(1) + ' · ' + IMC_TXT[p.catIMC] + '</span> ' +
    '<span class="tag is-warning is-light is-rounded">' + (NIVEL_TXT[p.nivel] || p.nivel) + '</span> ' +
    '<span class="tag is-light is-rounded">' + r.dias.length + ' días por semana · ' + impactoTxt + '</span>';

  function pintar() {
    const d = r.dias[actual];
    const tabs = r.dias.map((x, i) =>
      '<button class="dia-tab' + (i === actual ? ' activo' : '') + '" data-i="' + i + '">Día ' + (i + 1) + ' · ' + esc(x.nombre) + '</button>').join('');
    const total = d.ejercicios.length;
    const listos = d.ejercicios.filter(e => hechos[actual + ':' + e.id]).length;
    const cards = d.ejercicios.map(e => {
      const k = actual + ':' + e.id, ok = !!hechos[k];
      const dosis = e.series > 1 ? e.series + ' series × ' + e.reps : e.reps;
      return '<div class="ej-card' + (ok ? ' hecho' : '') + '">' +
        '<label class="checkbox"><input type="checkbox" data-k="' + esc(k) + '"' + (ok ? ' checked' : '') + '> <strong>' + esc(e.nombre) + '</strong></label>' +
        '<div class="tags mt-2"><span class="tag is-rounded">' + esc(GRUPOS[e.grupo] || e.grupo) + '</span>' +
        '<span class="tag is-rounded">' + esc(dosis) + '</span>' +
        (e.descanso ? '<span class="tag is-rounded">Descanso ' + e.descanso + ' s</span>' : '') + '</div>' +
        '<p>' + esc(e.tecnica || '') + '</p></div>';
    }).join('');
    cont.innerHTML = '<div class="dia-tabs">' + tabs + '</div>' +
      '<div class="box glass-box"><div class="level is-mobile mb-3"><h2 class="title is-5 m-0">' + esc(d.nombre) + '</h2>' +
      '<span class="is-size-7">' + listos + ' de ' + total + ' hechos</span></div>' +
      '<progress class="progress is-success mb-4" value="' + listos + '" max="' + total + '"></progress>' + cards + '</div>';
  }

  cont.addEventListener('click', e => {
    const t = e.target.closest('.dia-tab');
    if (t) { actual = Number(t.dataset.i); pintar(); }
  });
  cont.addEventListener('change', e => {
    const k = e.target.dataset.k;
    if (!k) return;
    if (e.target.checked) hechos[k] = true; else delete hechos[k];
    localStorage.setItem('rutinaHechos', JSON.stringify(hechos));
    pintar();
  });
  pintar();
})();
>>>>>>> 967cf28947e2df5509a77cbd3ae9157b5e3816bf
