/* ============================================================
   SEGUIMIENTO: avance real del usuario
   - Ejercicios hechos y comidas consumidas (se marcan en Rutinas y Plan nutricional)
   - Calorías quemadas / consumidas por día (historial)
   - Estado de cada día del calendario (pendiente, en progreso, completado)

   Los datos se guardan POR USUARIO en localStorage (clave vtv:<correo>:...), así que
   dos cuentas en el mismo navegador ya no se mezclan. Las marcas de la semana se
   reinician cada lunes; el historial de calorías se conserva.

   Requiere cargar antes datos.js y asignacion.js.
   ============================================================ */
const Seguimiento = (function () {
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const hoyISO = () => iso(new Date());
  const indiceHoy = () => (new Date().getDay() + 6) % 7;      // 0 = lunes ... 6 = domingo

  function lunesDe(fecha) {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  /* ---------- almacenamiento por usuario ---------- */
  const usuario = () => (localStorage.getItem('usuarioActivo') || 'anonimo').toLowerCase();
  const clave = nombre => 'vtv:' + usuario() + ':' + nombre;

  function leer(nombre, porDefecto) {
    try {
      const v = JSON.parse(localStorage.getItem(clave(nombre)));
      return v === null || v === undefined ? porDefecto : v;
    } catch (e) { return porDefecto; }
  }
  function guardar(nombre, valor) {
    try { localStorage.setItem(clave(nombre), JSON.stringify(valor)); } catch (e) { /* almacenamiento lleno o bloqueado */ }
  }

  // Cada lunes se borran las marcas de la semana anterior
  function revisarSemana() {
    const semana = iso(lunesDe(Date.now()));
    if (leer('semana', null) !== semana) {
      guardar('semana', semana);
      guardar('rutinaHechos', {});
      guardar('comidasHechas', {});
    }
    if (!leer('inicio', null)) guardar('inicio', semana);
  }
  revisarSemana();

  /* ---------- historial diario ---------- */
  // q = kcal quemadas, c = kcal consumidas, p/cb/g = proteína, carbohidratos, grasas (g)
  function ajustar(fecha, delta, signo) {
    const h = leer('historial', {});
    const d = h[fecha] || { q: 0, c: 0, p: 0, cb: 0, g: 0 };
    Object.keys(delta).forEach(k => { d[k] = Math.max(0, Math.round((d[k] || 0) + signo * delta[k])); });
    h[fecha] = d;
    guardar('historial', h);
  }
  const historial = () => leer('historial', {});
  const deHoy = () => historial()[hoyISO()] || { q: 0, c: 0, p: 0, cb: 0, g: 0 };
  const totalQuemadas = () => Object.values(historial()).reduce((t, d) => t + (d.q || 0), 0);

  /* ---------- calorías estimadas de un ejercicio (MET × peso × tiempo) ---------- */
  function kcalEjercicio(e, peso) {
    peso = Number(peso) || 70;
    let minutos;
    const t = String(e.reps || '').match(/(\d+)(?:\s*-\s*(\d+))?\s*min/i);   // cardio: "20-30 min"
    if (t) minutos = t[2] ? (Number(t[1]) + Number(t[2])) / 2 : Number(t[1]);
    else minutos = (Number(e.series) || 3) * (0.75 + (Number(e.descanso) || 60) / 60);   // fuerza: series × (trabajo + descanso)
    const met = e.grupo === 'fullbody' ? 7 : 4.5;
    return Math.max(1, Math.round(met * peso * minutos / 60));
  }

  /* ---------- marcar ejercicios y comidas ---------- */
  const leerHechos = () => leer('rutinaHechos', {});
  const leerComidas = () => leer('comidasHechas', {});

  function marcarEjercicio(dia, ejercicio, hecho, peso) {
    const hechos = leerHechos(), k = dia + ':' + ejercicio.id;
    if (hecho && !hechos[k]) {
      const kcal = kcalEjercicio(ejercicio, peso);
      hechos[k] = { kcal, fecha: hoyISO() };
      ajustar(hoyISO(), { q: kcal }, 1);
      guardar('ultimo', { ts: Date.now(), nombre: ejercicio.nombre });
    } else if (!hecho && hechos[k]) {
      ajustar(hechos[k].fecha, { q: hechos[k].kcal }, -1);      // se descuenta del día en que se sumó
      delete hechos[k];
    }
    guardar('rutinaHechos', hechos);
  }

  function marcarComida(nombreDia, comida, hecho) {
    const hechas = leerComidas(), k = nombreDia + ':' + comida.categoria;
    if (hecho && !hechas[k]) {
      hechas[k] = { kcal: comida.kcal, p: comida.p, cb: comida.c, g: comida.g, fecha: hoyISO() };
      ajustar(hoyISO(), { c: comida.kcal, p: comida.p, cb: comida.c, g: comida.g }, 1);
    } else if (!hecho && hechas[k]) {
      const h = hechas[k];
      ajustar(h.fecha, { c: h.kcal, p: h.p, cb: h.cb, g: h.g }, -1);
      delete hechas[k];
    }
    guardar('comidasHechas', hechas);
  }

  /* ---------- estado del calendario ---------- */
  function estadoDias(rutina) {
    const hechos = leerHechos();
    return rutina.dias.map((d, i) => {
      const total = d.ejercicios.length;
      const n = d.ejercicios.filter(e => hechos[i + ':' + e.id]).length;
      return {
        nombre: d.nombre, total, hechos: n,
        estado: total && n === total ? 'completado' : n ? 'progreso' : 'pendiente'
      };
    });
  }

  // Promedio entre la rutina de la semana y las comidas de los días que ya pasaron
  function adherencia(rutina, plan) {
    const dias = estadoDias(rutina);
    const totE = dias.reduce((s, d) => s + d.total, 0);
    const hecE = dias.reduce((s, d) => s + d.hechos, 0);
    const comidas = leerComidas();
    let totC = 0, hecC = 0;
    plan.dias.slice(0, indiceHoy() + 1).forEach(d => d.comidas.forEach(m => {
      totC++;
      if (comidas[d.nombre + ':' + m.categoria]) hecC++;
    }));
    const partes = [];
    if (totE) partes.push(hecE / totE);
    if (totC) partes.push(hecC / totC);
    return partes.length ? Math.round(partes.reduce((a, b) => a + b, 0) / partes.length * 100) : 0;
  }

  /* ---------- fechas para mostrar ---------- */
  function textoSemana() {
    const ini = lunesDe(Date.now()), fin = new Date(ini);
    fin.setDate(fin.getDate() + 6);
    const f = d => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
    return 'Semana del ' + f(ini) + ' al ' + f(fin);
  }
  function numeroSemana() {
    const inicio = new Date(leer('inicio', iso(lunesDe(Date.now()))) + 'T00:00:00');
    return Math.max(1, Math.floor((lunesDe(Date.now()) - inicio) / (7 * 24 * 3600 * 1000)) + 1);
  }
  function textoUltimo() {
    const u = leer('ultimo', null);
    if (!u) return 'Ninguno registrado aún';
    const f = new Date(u.ts).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    return f + ' · ' + u.nombre;
  }

  /* ---------- rutina y plan del usuario (la del admin tiene prioridad) ---------- */
  function pedirAsignaciones() {
    return fetch('../php/asignaciones.php?accion=mias')
      .then(r => r.json())
      .catch(() => ({ ok: false }));
  }

  function obtenerRutina(p) {
    return pedirAsignaciones().then(d => {
      const r = generarRutina(p);
      if (d && d.ok) {
        const mias = (d.asignaciones || []).filter(a => a.tipo === 'rutina');
        if (mias.length) {
          try {
            r.dias = mias.map(a => ({
              nombre: 'Rutina asignada',
              ejercicios: JSON.parse(a.contenido).map(e => ({
                id: e.id, nombre: e.nombre, grupo: e.grupo, reps: e.reps, tecnica: e.tecnica,
                series: Number(e.series) || 3, descanso: Number(e.series) > 1 ? 75 : 0
              }))
            }));
          } catch (err) { /* contenido dañado: se queda la rutina automática */ }
        }
      }
      return r;
    });
  }

  function obtenerPlan(p) {
    return pedirAsignaciones().then(d => {
      const plan = generarPlan(p);
      if (d && d.ok) {
        const asig = (d.asignaciones || []).find(a => a.tipo === 'plan');
        if (asig) {
          try {
            const platos = JSON.parse(asig.contenido);
            if (Number(asig.calorias)) plan.kcal = Number(asig.calorias);
            plan.dias.forEach((dia, i) => {
              dia.comidas = dia.comidas.map(m => {
                const c = platos.filter(a => a.categoria === m.categoria);
                if (!c.length) return m;           // sin platos asignados de esa comida: se deja el automático
                const a = c[i % c.length];
                return { categoria: m.categoria, nombre: a.nombre, porcion: 1, kcal: a.kcal, p: a.p, c: a.c, g: a.g };
              });
              dia.total = dia.comidas.reduce((t, m) => ({ kcal: t.kcal + m.kcal, p: t.p + m.p, c: t.c + m.c, g: t.g + m.g }), { kcal: 0, p: 0, c: 0, g: 0 });
            });
            plan.aviso = 'Este plan incluye platos y calorías asignados por tu administrador.';
          } catch (err) { /* contenido dañado: se queda el plan automático */ }
        }
      }
      return plan;
    });
  }

  return {
    indiceHoy, hoyISO,
    leerHechos, leerComidas, marcarEjercicio, marcarComida, kcalEjercicio,
    deHoy, totalQuemadas, estadoDias, adherencia,
    textoSemana, numeroSemana, textoUltimo,
    obtenerRutina, obtenerPlan
  };
})();
