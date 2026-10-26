/* ============================================================
   MOTOR DE ASIGNACIÓN: perfil -> rutina y plan nutricional
   ============================================================ */

const OBJ_TXT = {
  perder_peso: 'Perder peso', ganar_peso: 'Ganar peso',
  ganar_masa_muscular: 'Ganar masa muscular', mantener_peso: 'Mantener peso'
};
const IMC_TXT = { b: 'Bajo peso', n: 'Peso saludable', s: 'Sobrepeso', o: 'Obesidad' };
const NIVEL_TXT = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };

function esc(t) {
  return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function calcularEdad(fecha) {
  const hoy = new Date(), n = new Date(fecha);
  let e = hoy.getFullYear() - n.getFullYear();
  const m = hoy.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) e--;
  return e;
}

function categoriaIMC(imc) {
  return imc < 18.5 ? 'b' : imc < 25 ? 'n' : imc < 30 ? 's' : 'o';
}

function obtenerPerfil() {
  const g = k => localStorage.getItem(k);
  const peso = parseFloat(g('usuarioPeso')), altura = parseFloat(g('usuarioAltura'));
  if (!peso || !altura || !g('usuarioObjetivo') || !g('usuarioFechaNac')) return null;
  const p = {
    nombre: g('usuarioNombre') || '', peso, altura, objetivo: g('usuarioObjetivo'),
    sexo: g('usuarioSexo') || 'masculino', nivel: g('usuarioNivel') || 'principiante',
    fechaNac: g('usuarioFechaNac')
  };
  p.edad = calcularEdad(p.fechaNac);
  p.imc = peso / Math.pow(altura / 100, 2);
  p.catIMC = categoriaIMC(p.imc);
  return p;
}

function vacio(mensaje) {
  return '<div class="box glass-box has-text-centered"><p class="mb-4">' + esc(mensaje) + '</p>' +
    '<a href="evaluacion.html" class="button btn-submit is-rounded">Completar valoración inicial</a></div>';
}

/* ---------------- RUTINAS ---------------- */

// [nombre del día, [[grupo muscular, cantidad de ejercicios], ...]]
const PLANTILLAS = {
  principiante: [
    ['Cuerpo completo A', [['piernas', 1], ['pecho', 1], ['espalda', 1], ['core', 1]]],
    ['Cuerpo completo B', [['isquios_gluteo', 1], ['hombros', 1], ['espalda', 1], ['brazos', 1], ['core', 1]]],
    ['Cuerpo completo C', [['piernas', 1], ['pecho', 1], ['isquios_gluteo', 1], ['brazos', 1], ['core', 1]]]
  ],
  intermedio: [
    ['Torso A', [['pecho', 2], ['espalda', 2], ['hombros', 1], ['brazos', 1]]],
    ['Pierna A', [['piernas', 2], ['isquios_gluteo', 2], ['core', 1]]],
    ['Torso B', [['espalda', 2], ['pecho', 1], ['hombros', 2], ['brazos', 2]]],
    ['Pierna B', [['isquios_gluteo', 2], ['piernas', 2], ['core', 1]]]
  ],
  avanzado: [
    ['Empuje', [['pecho', 2], ['hombros', 2], ['brazos', 1], ['core', 1]]],
    ['Tirón', [['espalda', 3], ['brazos', 1], ['core', 1]]],
    ['Pierna', [['piernas', 2], ['isquios_gluteo', 2], ['core', 1]]],
    ['Torso', [['pecho', 1], ['espalda', 1], ['hombros', 1], ['brazos', 2]]],
    ['Pierna y glúteo', [['isquios_gluteo', 2], ['piernas', 1], ['core', 1]]]
  ]
};

function generarRutina(p) {
  const enf = { perder_peso: 'p', ganar_masa_muscular: 'h', ganar_peso: 'h', mantener_peso: 'f' }[p.objetivo] || 'f';
  const descanso = { p: 45, h: 75, f: 120 }[enf];

  // Impacto permitido según IMC, edad y nivel
  const permit = ['b'];
  if (p.imc < 30 && (p.imc < 25 || p.nivel !== 'principiante') && p.edad < 65) permit.push('m');
  if (p.imc < 25 && p.nivel === 'avanzado' && p.edad < 55) permit.push('a');

  const banco = getEjercicios();
  const usados = new Set();
  const plantilla = PLANTILLAS[p.nivel] || PLANTILLAS.principiante;

  const dias = plantilla.map((d, i) => {
    const bloques = d[1].slice();
    if (p.objetivo === 'perder_peso' || (p.objetivo === 'mantener_peso' && i % 2 === 0)) bloques.push(['fullbody', 1]);
    const ejercicios = [];
    bloques.forEach(([grupo, n]) => {
      const cand = banco
        .filter(e => e.grupo === grupo && [...(e.impacto || 'bma')].some(x => permit.includes(x)))
        .map((e, idx) => ({ e, idx, s: ((e.enfoques || '').includes(enf) ? 2 : 0) + (e.compuesto ? 1 : 0) }))
        .sort((a, b) => b.s - a.s || a.idx - b.idx)
        .map(x => x.e);
      if (!cand.length) return;
      const ini = i % cand.length;
      const rot = cand.slice(ini).concat(cand.slice(0, ini));
      const orden = rot.filter(e => !usados.has(e.id)).concat(rot.filter(e => usados.has(e.id)));
      orden.slice(0, n).forEach(e => {
        usados.add(e.id);
        const cardio = grupo === 'fullbody' && Number(e.series) === 1;
        ejercicios.push({
          id: e.id, nombre: e.nombre, grupo: e.grupo, reps: e.reps, tecnica: e.tecnica,
          series: p.nivel === 'principiante' ? Math.min(Number(e.series) || 3, 3) : (Number(e.series) || 3),
          descanso: cardio ? 0 : descanso
        });
      });
    });
    return { nombre: d[0], ejercicios };
  });
  return { enfoque: enf, permit, dias };
}

/* ---------------- NUTRICIÓN ---------------- */

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const COMIDAS = [['desayuno', 0.25], ['almuerzo', 0.35], ['cena', 0.25], ['snack', 0.15]];

function generarPlan(p) {
  const tmb = 10 * p.peso + 6.25 * p.altura - 5 * p.edad + (p.sexo === 'femenino' ? -161 : 5);
  const factor = { principiante: 1.4, intermedio: 1.55, avanzado: 1.7 }[p.nivel] || 1.4;
  let obj = p.objetivo, aviso = '';
  if (obj === 'perder_peso' && p.imc < 18.5) {
    obj = 'mantener_peso';
    aviso = 'Tu IMC está en rango de bajo peso, por eso el plan mantiene tus calorías en lugar de reducirlas. Consulta con un profesional de la salud.';
  }
  if (obj === 'ganar_peso' && p.imc >= 30) {
    obj = 'mantener_peso';
    aviso = 'Con un IMC en rango de obesidad, aumentar de peso no es recomendable: el plan mantiene tus calorías. Consulta con un profesional de la salud.';
  }
  const ajuste = { perder_peso: p.imc >= 30 ? 0.75 : 0.8, ganar_peso: 1.15, ganar_masa_muscular: 1.1, mantener_peso: 1 }[obj];
  const piso = p.sexo === 'femenino' ? 1200 : 1500;
  const kcal = Math.round(Math.max(tmb * factor * ajuste, piso) / 10) * 10;
  const prot = Math.round(p.peso * { perder_peso: 1.8, ganar_masa_muscular: 2, ganar_peso: 1.6, mantener_peso: 1.4 }[obj]);
  const gras = Math.round(kcal * 0.25 / 9);
  const carb = Math.max(0, Math.round((kcal - prot * 4 - gras * 9) / 4));

  const codObj = { perder_peso: 'p', ganar_peso: 'g', ganar_masa_muscular: 'm', mantener_peso: 't' }[obj];
  const banco = getAlimentos();
  const aptos = (a, cat, o) => a.categoria === cat &&
    (!o || (a.objetivos || 'pgmt').includes(o)) && (a.imc || 'bnso').includes(p.catIMC);

  const dias = DIAS_SEMANA.map((nombre, d) => {
    const comidas = COMIDAS.map(([cat, parte]) => {
      const meta = kcal * parte;
      let c = banco.filter(a => aptos(a, cat, codObj));
      if (!c.length) c = banco.filter(a => aptos(a, cat, null));
      if (!c.length) c = banco.filter(a => a.categoria === cat);
      if (!c.length) return null;
      c = c.sort((x, y) => Math.abs(x.kcal - meta) - Math.abs(y.kcal - meta)).slice(0, 5);
      const a = c[d % c.length];
      const f = Math.min(1.5, Math.max(0.75, Math.round(meta / a.kcal / 0.05) * 0.05));
      return {
        categoria: cat, nombre: a.nombre, porcion: Math.round(f * 100) / 100,
        kcal: Math.round(a.kcal * f), p: Math.round(a.p * f), c: Math.round(a.c * f), g: Math.round(a.g * f)
      };
    }).filter(Boolean);
    const total = comidas.reduce((t, m) => ({ kcal: t.kcal + m.kcal, p: t.p + m.p, c: t.c + m.c, g: t.g + m.g }), { kcal: 0, p: 0, c: 0, g: 0 });
    return { nombre, comidas, total };
  });
  return { kcal, prot, carb, gras, aviso, objetivo: obj, dias };
}
