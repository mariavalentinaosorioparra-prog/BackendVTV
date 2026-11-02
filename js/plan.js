(function () {
  const cont = document.getElementById('contenido');
  const p = obtenerPerfil();
  if (!p) { cont.innerHTML = vacio('Aún no tenemos tu valoración inicial, así que no podemos calcular tu plan nutricional.'); return; }

  // Pregunta a la BD si el admin te asignó un plan; si no, se calcula automático
  fetch('../php/asignaciones.php?accion=mias')
    .then(r => r.json())
    .catch(() => ({ ok: false }))
    .then(d => {
      const plan = generarPlan(p);
      if (d && d.ok) {
        const asig = (d.asignaciones || []).find(a => a.tipo === 'plan');
        if (asig) {
          const platos = JSON.parse(asig.contenido);
          if (Number(asig.calorias)) plan.kcal = Number(asig.calorias);
          plan.dias.forEach((dia, i) => {
            dia.comidas = dia.comidas.map(m => {
              const c = platos.filter(a => a.categoria === m.categoria);
              if (!c.length) return m; // sin platos asignados de esa comida: se deja el automático
              const a = c[i % c.length];
              return { categoria: m.categoria, nombre: a.nombre, porcion: 1, kcal: a.kcal, p: a.p, c: a.c, g: a.g };
            });
            dia.total = dia.comidas.reduce((t, m) => ({ kcal: t.kcal + m.kcal, p: t.p + m.p, c: t.c + m.c, g: t.g + m.g }), { kcal: 0, p: 0, c: 0, g: 0 });
          });
          plan.aviso = 'Este plan incluye platos y calorías asignados por tu administrador.';
        }
      }
      iniciar(plan);
    });

  function iniciar(plan) {
    const NOMBRE_COMIDA = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', snack: 'Snack' };
    let actual = 0;

    document.getElementById('resumen').innerHTML =
      '<span class="tag is-success is-light is-rounded">' + esc(OBJ_TXT[plan.objetivo] || plan.objetivo) + '</span> ' +
      '<span class="tag is-info is-light is-rounded">IMC ' + p.imc.toFixed(1) + ' · ' + IMC_TXT[p.catIMC] + '</span>';

    const stat = (n, e) => '<div class="column is-3 is-6-mobile"><div class="box glass-box stat"><div class="num">' + n + '</div><div class="etq">' + e + '</div></div></div>';
    document.getElementById('metas').innerHTML =
      (plan.aviso ? '<div class="aviso">' + esc(plan.aviso) + '</div>' : '') +
      '<div class="columns is-multiline is-mobile">' +
      stat(plan.kcal + ' kcal', 'Meta diaria') + stat(plan.prot + ' g', 'Proteína') +
      stat(plan.carb + ' g', 'Carbohidratos') + stat(plan.gras + ' g', 'Grasas') + '</div>';

    function pintar() {
      const d = plan.dias[actual];
      const tabs = plan.dias.map((x, i) => '<button class="dia-tab' + (i === actual ? ' activo' : '') + '" data-i="' + i + '">' + x.nombre + '</button>').join('');
      const cards = d.comidas.map(m =>
        '<div class="comida-card"><div class="level is-mobile mb-1"><strong>' + NOMBRE_COMIDA[m.categoria] + '</strong>' +
        '<span class="tag is-rounded">' + m.kcal + ' kcal</span></div>' +
        '<div>' + esc(m.nombre) + '</div>' +
        '<p>Porción ' + m.porcion + '× · P ' + m.p + ' g · C ' + m.c + ' g · G ' + m.g + ' g</p></div>').join('');
      cont.innerHTML = '<div class="dia-tabs">' + tabs + '</div><div class="box glass-box">' + cards +
        '<p class="is-size-7 mt-3">Total del día: <strong>' + d.total.kcal + ' kcal</strong> · P ' + d.total.p + ' g · C ' + d.total.c + ' g · G ' + d.total.g + ' g</p></div>';
    }
    cont.addEventListener('click', e => {
      const t = e.target.closest('.dia-tab');
      if (t) { actual = Number(t.dataset.i); pintar(); }
    });
    pintar();
  }
})();