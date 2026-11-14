/* ============================================================
   SEGUIMIENTO: avance real del usuario
   - Ejercicios hechos y comidas consumidas (se marcan en Rutinas y Plan nutricional)
   - Calorías quemadas / consumidas por día (historial)
   - Estado de cada día del calendario (pendiente, en progreso, completado)

   Los datos se guardan POR USUARIO en localStorage (clave vtv:<correo>:...), así que
   dos cuentas en el mismo navegador ya no se mezclan. Las marcas de la semana se
   reinician cada lunes; el historial de calorías se conserva.

   NUEVO: cada cambio también se guarda en la BD (tabla progreso_diario, vía
   php/seguimiento.php), y al abrir la app en otro navegador el historial se
   recupera desde la BD.

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

  /* ---------- sincronización con la BD (tabla progreso_diario) ---------- */
  const URL_SEG = '../php/seguimiento.php';
  const fechaHora = ts => {
    const d = new Date(ts);
    return iso(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  };

  // Envía a la BD el resumen completo de un día (crea o actualiza la fila de esa fecha)
  function sincronizar(fecha) {
    const h = historial()[fecha] || { q: 0, c: 0, p: 0, cb: 0, g: 0 };
    const hechos = leerHechos(), comidas = leerComidas();
    const metas = leer('metas', {});
    const diasRutina = leer('rutinaDias', []);           // ids de ejercicios de cada día de la rutina

    // Ejercicios marcados en esta fecha y días de rutina que se trabajaron
    const clavesDia = Object.keys(hechos).filter(k => hechos[k].fecha === fecha);
    const diasTocados = [...new Set(clavesDia.map(k => Number(k.split(':')[0])))];
    const totales = diasTocados.reduce((t, i) => t + ((diasRutina[i] || []).length), 0);
    const sesion = diasTocados.some(i => (diasRutina[i] || []).length &&
      diasRutina[i].every(id => hechos[i + ':' + id])) ? 1 : 0;

    const comidasDia = Object.values(comidas).filter(m => m.fecha === fecha).length;
    const u = leer('ultimo', null);
    const ultimoEsDeHoy = u && iso(new Date(u.ts)) === fecha;

    const d = new FormData();
    d.append('accion', 'guardar');
    d.append('fecha', fecha);
    d.append('peso', parseFloat(localStorage.getItem('usuarioPeso')) || 0);
    d.append('calorias_quemadas', h.q || 0);
    d.append('calorias_consumidas', h.c || 0);
    d.append('proteinas_consumidas', h.p || 0);
    d.append('carbohidratos_consumidos', h.cb || 0);
    d.append('grasas_consumidas', h.g || 0);
    d.append('comidas_registradas', comidasDia);
    d.append('meta_calorias', metas.kcal || 0);
    d.append('meta_proteinas', metas.prot || 0);
    d.append('meta_carbohidratos', metas.carb || 0);
    d.append('ejercicios_completados', clavesDia.length);
    d.append('ejercicios_totales', totales);
    d.append('sesion_completada', sesion);
    if (ultimoEsDeHoy) {
      d.append('ultimo_registro', fechaHora(u.ts));
      d.append('ultima_actividad', u.nombre || '');
    }

    return fetch(URL_SEG, { method: 'POST', body: d, keepalive: true })
      .then(r => r.json())
      .then(res => { if (!res.ok) console.warn('Progreso no guardado en la BD:', res.mensaje); })
      .catch(err => console.warn('Progreso no guardado en la BD:', err));
  }

  // Trae el historial de la BD (una sola vez por página). Completa lo que falte en este
  // navegador y sube a la BD los días que solo existen aquí.
  let restaurando = null;
  function restaurarDesdeBD() {
    if (restaurando) return restaurando;
    restaurando = fetch(URL_SEG + '?accion=listar')
      .then(r => r.json())
      .then(d => {
        if (!d || !d.ok) return;
        const filas = d.dias || [];
        const h = historial();
        const enBD = new Set(filas.map(f => f.fecha));
        let cambio = false;

        filas.forEach(f => {
          if (!h[f.fecha]) {
            h[f.fecha] = {
              q: Number(f.calorias_quemadas) || 0, c: Number(f.calorias_consumidas) || 0,
              p: Number(f.proteinas_consumidas) || 0, cb: Number(f.carbohidratos_consumidos) || 0,
              g: Number(f.grasas_consumidas) || 0
            };
            cambio = true;
          }
        });
        if (cambio) guardar('historial', h);

        // Último registro
        if (!leer('ultimo', null)) {
          const u = filas.filter(f => f.ultimo_registro).pop();
          if (u) guardar('ultimo', { ts: new Date(u.ultimo_registro.replace(' ', 'T')).getTime(), nombre: u.ultima_actividad || '' });
        }

        // Semana de inicio (para "Semana X de 12")
        if (filas.length) {
          const lun = iso(lunesDe(filas[0].fecha + 'T00:00:00'));
          if (lun < leer('inicio', lun)) guardar('inicio', lun);
        }

        // Días que solo están en este navegador -> se suben a la BD
        Object.keys(h).filter(f => !enBD.has(f)).forEach(sincronizar);
      })
      .catch(() => { /* sin servidor: se sigue trabajando solo con localStorage */ });
    return restaurando;
  }
  restaurarDesdeBD();

  /* ---------- marcar ejercicios y comidas ---------- */
  const leerHechos = () => leer('rutinaHechos', {});
  const leerComidas = () => leer('comidasHechas', {});

  function marcarEjercicio(dia, ejercicio, hecho, peso) {
    const hechos = leerHechos(), k = dia + ':' + ejercicio.id;
    let fecha = hoyISO();
    if (hecho && !hechos[k]) {
      const kcal = kcalEjercicio(ejercicio, peso);
      hechos[k] = { kcal, fecha };
      ajustar(fecha, { q: kcal }, 1);
      guardar('ultimo', { ts: Date.now(), nombre: ejercicio.nombre });
    } else if (!hecho && hechos[k]) {
      fecha = hechos[k].fecha;                                  // se descuenta del día en que se sumó
      ajustar(fecha, { q: hechos[k].kcal }, -1);
      delete hechos[k];
    }
    guardar('rutinaHechos', hechos);
    sincronizar(fecha);
  }

  function marcarComida(nombreDia, comida, hecho) {
    const hechas = leerComidas(), k = nombreDia + ':' + comida.categoria;
    let fecha = hoyISO();
    if (hecho && !hechas[k]) {
      hechas[k] = { kcal: comida.kcal, p: comida.p, cb: comida.c, g: comida.g, fecha };
      ajustar(fecha, { c: comida.kcal, p: comida.p, cb: comida.c, g: comida.g }, 1);
    } else if (!hecho && hechas[k]) {
      const h = hechas[k];
      fecha = h.fecha;
      ajustar(fecha, { c: h.kcal, p: h.p, cb: h.cb, g: h.g }, -1);
      delete hechas[k];
    }
    guardar('comidasHechas', hechas);
    sincronizar(fecha);
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
    const asig = fetch('../php/asignaciones.php?accion=mias')
      .then(r => r.json())
      .catch(() => ({ ok: false }));
    // Espera también a que se recupere el historial de la BD
    return Promise.all([asig, restaurarDesdeBD()]).then(([d]) => d);
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
                series: Number(e.series) || 3, descanso: Number(e.series) > 1 ? 75 : 0,
                video: e.video || ''
              }))
            }));
          } catch (err) { /* contenido dañado: se queda la rutina automática */ }
        }
      }
      // Se guarda la estructura de la rutina para calcular sesiones completadas en la BD
      guardar('rutinaDias', r.dias.map(x => x.ejercicios.map(e => e.id)));
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
                return { categoria: m.categoria, nombre: a.nombre, porcion: 1, kcal: a.kcal, p: a.p, c: a.c, g: a.g, modelo3d: a.modelo3d || '' };
              });
              dia.total = dia.comidas.reduce((t, m) => ({ kcal: t.kcal + m.kcal, p: t.p + m.p, c: t.c + m.c, g: t.g + m.g }), { kcal: 0, p: 0, c: 0, g: 0 });
            });
            plan.aviso = 'Este plan incluye platos y calorías asignados por tu administrador.';
          } catch (err) { /* contenido dañado: se queda el plan automático */ }
        }
      }
      // Se guardan las metas del plan para registrarlas en la BD
      guardar('metas', { kcal: plan.kcal, prot: plan.prot, carb: plan.carb });
      return plan;
    });
  }

  return {
    indiceHoy, hoyISO,
    leerHechos, leerComidas, marcarEjercicio, marcarComida, kcalEjercicio,
    deHoy, totalQuemadas, estadoDias, adherencia,
    textoSemana, numeroSemana, textoUltimo,
    obtenerRutina, obtenerPlan,
    sincronizar, listo: restaurarDesdeBD
  };
})();


/* ============================================================
   CAJÓN DE SUGERENCIAS (usuario) — Rutinas.html y planNasignado.html
   ============================================================ */
(function () {
  const form = document.getElementById('formSugerencia');
  if (!form) return;   // la página no tiene el cajón de sugerencias

  const URL_SUG = '../php/sugerencias.php';
  const MIN = 5, MAX = 1000;
  const TIPOS = ['alergia', 'discapacidad', 'lesion', 'condicion', 'otro'];
  const DESTINOS = ['entrenador', 'nutriologo', 'ambos'];
  const TIPO_TXT = { alergia: 'Alergia / intolerancia', discapacidad: 'Discapacidad', lesion: 'Lesión', condicion: 'Condición médica', otro: 'Otro' };
  const DEST_TXT = { entrenador: 'Entrenador', nutriologo: 'Nutriólogo', ambos: 'Entrenador y nutriólogo' };

  const tipo = document.getElementById('tipo');
  const dirigido = document.getElementById('dirigido_a');
  const desc = document.getElementById('descripcion');
  const contador = document.getElementById('contador');
  const msg = document.getElementById('msgSugerencia');
  const lista = document.getElementById('listaSugerencias');
  const boton = form.querySelector('button[type="submit"]');

  const escS = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function mensaje(texto, ok) {
    if (!msg) return;
    msg.textContent = texto;
    msg.className = 'form-message ' + (ok ? 'is-ok' : 'is-error');
    msg.hidden = false;
  }

  function marcarError(campo, hayError) {
    const caja = campo.closest('.select') || campo;
    caja.classList.toggle('is-danger', hayError);
    campo.setAttribute('aria-invalid', hayError ? 'true' : 'false');
  }

  function actualizarContador() {
    if (!contador) return;
    const n = desc.value.trim().length;
    contador.textContent = desc.value.length + ' / ' + MAX;
    contador.classList.toggle('has-text-danger', n > 0 && n < MIN);
  }

  // Validación: ningún bloque puede quedar vacío
  function validar() {
    const errores = [];
    const texto = desc.value.trim();

    const tipoOk = TIPOS.includes(tipo.value);
    marcarError(tipo, !tipoOk);
    if (!tipoOk) errores.push('Selecciona qué quieres reportar.');

    const destOk = DESTINOS.includes(dirigido.value);
    marcarError(dirigido, !destOk);
    if (!destOk) errores.push('Selecciona a quién va dirigido.');

    const descOk = texto.length >= MIN && texto.length <= MAX;
    marcarError(desc, !descOk);
    if (!texto) errores.push('La descripción no puede quedar vacía.');
    else if (texto.length < MIN) errores.push('La descripción debe tener al menos ' + MIN + ' caracteres.');
    else if (texto.length > MAX) errores.push('La descripción no puede pasar de ' + MAX + ' caracteres.');

    return errores;
  }

  tipo.addEventListener('change', () => { if (tipo.value) marcarError(tipo, false); });
  dirigido.addEventListener('change', () => { if (dirigido.value) marcarError(dirigido, false); });
  desc.addEventListener('input', () => {
    actualizarContador();
    if (desc.value.trim().length >= MIN) marcarError(desc, false);
  });
  actualizarContador();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (msg) msg.hidden = true;

    const errores = validar();
    if (errores.length) {
      mensaje(errores.join(' '), false);
      const primero = form.querySelector('[aria-invalid="true"]');
      if (primero) primero.focus();
      return;
    }

    const fd = new FormData();
    fd.append('accion', 'crear');
    fd.append('tipo', tipo.value);
    fd.append('dirigido_a', dirigido.value);
    fd.append('descripcion', desc.value.trim());

    boton.disabled = true;
    boton.classList.add('is-loading');
    try {
      const r = await llamarAPI(URL_SUG, { method: 'POST', body: fd });
      mensaje(r.mensaje || (r.ok ? 'Enviado.' : 'No se pudo enviar.'), r.ok);
      if (r.ok) {
        form.reset();
        actualizarContador();
        cargarMias();
      }
    } catch (err) {
      mensaje(err.message, false);
    } finally {
      boton.disabled = false;
      boton.classList.remove('is-loading');
    }
  });

  // "Mis reportes" con la respuesta del admin
  async function cargarMias() {
    if (!lista) return;
    try {
      const r = await llamarAPI(URL_SUG + '?accion=mias');
      if (!r.ok) { lista.innerHTML = '<p class="has-text-grey">' + escS(r.mensaje) + '</p>'; return; }
      if (!r.sugerencias.length) { lista.innerHTML = '<p class="has-text-grey">Aún no has enviado reportes.</p>'; return; }
      lista.innerHTML = r.sugerencias.map(s => {
        const revisado = s.estado === 'revisado';
        return '<div class="sug-card">' +
          '<div class="tags mb-2">' +
            '<span class="tag is-rounded">' + escS(TIPO_TXT[s.tipo] || s.tipo) + '</span>' +
            '<span class="tag is-rounded">Para: ' + escS(DEST_TXT[s.dirigido_a] || s.dirigido_a) + '</span>' +
            '<span class="tag is-rounded ' + (revisado ? 'is-success' : 'is-warning') + ' is-light">' + (revisado ? 'Revisado' : 'Pendiente') + '</span>' +
            '<span class="tag is-rounded is-dark">' + escS(s.fecha) + '</span>' +
          '</div>' +
          '<p>' + escS(s.descripcion) + '</p>' +
          (s.respuesta ? '<div class="sug-respuesta"><strong>Respuesta:</strong> ' + escS(s.respuesta) + '</div>' : '') +
          '<button type="button" class="button is-small is-danger is-light is-rounded mt-3" data-borrar="' + s.id + '">Eliminar</button>' +
        '</div>';
      }).join('');
    } catch (err) {
      lista.innerHTML = '<p class="has-text-danger">' + escS(err.message) + '</p>';
    }
  }

  if (lista) {
    lista.addEventListener('click', async e => {
      const b = e.target.closest('[data-borrar]');
      if (!b || !confirm('¿Eliminar este reporte?')) return;
      const fd = new FormData();
      fd.append('accion', 'eliminar');
      fd.append('id', b.dataset.borrar);
      try {
        const r = await llamarAPI(URL_SUG, { method: 'POST', body: fd });
        mensaje(r.mensaje, r.ok);
        if (r.ok) cargarMias();
      } catch (err) { mensaje(err.message, false); }
    });
  }

  cargarMias();
})();