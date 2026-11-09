/* ============================================================
   PROGRESO: lee lo que el usuario marcó en Rutinas y Plan nutricional
   (ver seguimiento.js) y lo muestra en Progreso.html.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const $ = id => document.getElementById(id);
  const fmt = n => Number(n).toLocaleString('es-CO');
  const pct = (valor, meta) => meta > 0 ? Math.min(100, Math.round(valor / meta * 100)) : 0;
  const barra = (id, valor) => { const b = $(id); if (b) { b.value = valor; b.textContent = valor + '%'; } };

  const p = obtenerPerfil();
  if (!p) {
    mostrarAlerta('Completa tu valoración inicial para ver tu progreso.', 'warning');
    return;
  }

  // Datos que no dependen de la rutina ni del plan
  $('textoObjetivo').textContent = OBJ_TXT[p.objetivo] || p.objetivo;
  $('etiquetaSemana').textContent = 'Semana ' + Math.min(Seguimiento.numeroSemana(), 12) + ' de 12';
  $('txtPesoActual').textContent = p.peso.toFixed(1) + ' kg';
  $('txtCambioPeso').textContent = 'IMC ' + p.imc.toFixed(1) + ' · ' + IMC_TXT[p.catIMC];
  $('txtCaloriasQuemadas').textContent = fmt(Seguimiento.totalQuemadas()) + ' kcal';
  $('txtUltimoEntreno').textContent = Seguimiento.textoUltimo();

  // Lo demás se calcula con la rutina y el plan vigentes (los asignados por el admin, si los hay)
  Promise.all([Seguimiento.obtenerRutina(p), Seguimiento.obtenerPlan(p)]).then(function (res) {
    const rutina = res[0], plan = res[1];
    const hoy = Seguimiento.deHoy();

    // Cumplimiento nutricional (hoy)
    $('txtCaloriasConsumidas').textContent = fmt(hoy.c) + ' / ' + fmt(plan.kcal) + ' kcal';
    barra('progBarCalorias', pct(hoy.c, plan.kcal));
    $('txtProteinas').textContent = hoy.p + 'g / ' + plan.prot + 'g';
    barra('progBarProteinas', pct(hoy.p, plan.prot));
    $('txtCarbos').textContent = hoy.cb + 'g / ' + plan.carb + 'g';
    barra('progBarCarbos', pct(hoy.cb, plan.carb));

    // Avance de entrenamiento (semana)
    const dias = Seguimiento.estadoDias(rutina);
    const completos = dias.filter(d => d.estado === 'completado').length;
    const ejTotal = dias.reduce((s, d) => s + d.total, 0);
    const ejHechos = dias.reduce((s, d) => s + d.hechos, 0);
    $('txtSesiones').textContent = completos + ' de ' + dias.length + ' días';
    barra('progBarSesiones', pct(completos, dias.length));
    $('txtVolumen').textContent = ejHechos + ' de ' + ejTotal;
    barra('progBarVolumen', pct(ejHechos, ejTotal));

    // Adherencia general
    $('txtAdherencia').textContent = Seguimiento.adherencia(rutina, plan) + '%';
  });
});
