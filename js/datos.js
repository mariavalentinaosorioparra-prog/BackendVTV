/* ============================================================
   BANCOS BASE: ejercicios y alimentos (los del admin se suman)
   ============================================================ */

const GRUPOS = {
  pecho: 'Pecho', espalda: 'Espalda', piernas: 'Piernas', isquios_gluteo: 'Isquios y glúteos',
  hombros: 'Hombros', brazos: 'Brazos', core: 'Core', fullbody: 'Cardio / Full body'
};

// [nombre, grupo, impacto (b=bajo, m=moderado, a=alto), enfoque (p=perder, h=hipertrofia, f=fuerza), series, reps, compuesto, técnica]
const _EJ = [
  // Pecho
  ['Flexiones inclinadas (manos en banco)', 'pecho', 'b', 'pf', 3, '8-12', 1, 'Cuerpo en línea recta, codos a 45° del torso, baja el pecho hasta rozar el banco.'],
  ['Press de pecho en máquina', 'pecho', 'b', 'phf', 3, '10-12', 1, 'Espalda pegada al respaldo, empuja sin bloquear los codos y regresa lento.'],
  ['Press de pecho con mancuernas', 'pecho', 'm', 'hf', 4, '8-12', 1, 'Escápulas juntas, baja las mancuernas a la altura del pecho y empuja en vertical.'],
  ['Flexiones en el suelo', 'pecho', 'm', 'phf', 3, '8-15', 1, 'Manos al ancho de hombros, abdomen firme, pecho cerca del suelo sin hundir la cadera.'],
  ['Aperturas con mancuernas', 'pecho', 'm', 'h', 3, '10-15', 0, 'Codos ligeramente flexionados; abre hasta sentir estiramiento y cierra como un abrazo.'],
  ['Press de banca con barra', 'pecho', 'a', 'hf', 4, '5-8', 1, 'Pies firmes, barra al pecho medio, empuja explosivo y pide ayuda si subes mucho peso.'],
  // Espalda
  ['Remo sentado en máquina', 'espalda', 'b', 'phf', 3, '10-12', 1, 'Pecho alto, lleva los codos atrás juntando escápulas, sin balancear el tronco.'],
  ['Jalón al pecho en polea', 'espalda', 'b', 'phf', 3, '10-12', 1, 'Agarre ancho, tira de la barra hacia la clavícula sacando pecho; no te inclines atrás.'],
  ['Superman en el suelo', 'espalda', 'b', 'p', 3, '12-15', 0, 'Boca abajo, eleva brazos y piernas a la vez, sostén 2 segundos y baja controlado.'],
  ['Remo con mancuerna a una mano', 'espalda', 'm', 'hf', 3, '10-12', 1, 'Apoya mano y rodilla en el banco, espalda plana, tira del codo hacia la cadera.'],
  ['Dominadas asistidas', 'espalda', 'm', 'hf', 3, '6-10', 1, 'Agarre prono, sube hasta que la barbilla pase la barra y baja en 3 segundos.'],
  ['Remo con barra', 'espalda', 'a', 'hf', 4, '6-10', 1, 'Tronco a 45°, espalda neutra, lleva la barra al ombligo sin impulso.'],
  // Piernas
  ['Sentadilla a silla', 'piernas', 'b', 'ph', 3, '12-15', 1, 'Siéntate con control, toca la silla y sube empujando con los talones; rodillas hacia afuera.'],
  ['Prensa de piernas', 'piernas', 'b', 'phf', 4, '10-12', 1, 'Pies al ancho de hombros, baja hasta 90° sin despegar la zona lumbar del respaldo.'],
  ['Extensión de cuádriceps en máquina', 'piernas', 'b', 'h', 3, '12-15', 0, 'Extiende sin bloquear la rodilla, aprieta 1 segundo arriba y baja lento.'],
  ['Sentadilla goblet con mancuerna', 'piernas', 'm', 'phf', 4, '10-12', 1, 'Mancuerna junto al pecho, torso erguido, baja hasta que los muslos queden paralelos.'],
  ['Zancadas caminando', 'piernas', 'm', 'ph', 3, '10 por pierna', 1, 'Paso largo, rodilla delantera sobre el tobillo, baja la trasera casi hasta el suelo.'],
  ['Sentadilla con barra', 'piernas', 'a', 'hf', 4, '5-8', 1, 'Barra sobre trapecio, pecho arriba, baja controlado y sube sin despegar talones.'],
  ['Sentadilla búlgara', 'piernas', 'a', 'hf', 3, '8-10 por pierna', 1, 'Pie trasero en banco, torso recto, baja vertical y empuja con la pierna delantera.'],
  // Isquios y glúteos
  ['Puente de glúteos', 'isquios_gluteo', 'b', 'phf', 3, '12-15', 1, 'Pies cerca de la cadera, sube apretando glúteos y sostén 1 segundo arriba.'],
  ['Curl femoral en máquina', 'isquios_gluteo', 'b', 'h', 3, '10-12', 0, 'Cadera pegada al asiento, flexiona completo y regresa lento sin rebotar.'],
  ['Patada de glúteo en polea', 'isquios_gluteo', 'b', 'ph', 3, '12-15 por pierna', 0, 'Tronco estable, extiende la pierna atrás sin arquear la lumbar y aprieta el glúteo.'],
  ['Peso muerto rumano con mancuernas', 'isquios_gluteo', 'm', 'hf', 4, '8-12', 1, 'Rodillas semiflexionadas, lleva la cadera atrás con espalda recta hasta sentir el estiramiento.'],
  ['Hip thrust con barra', 'isquios_gluteo', 'm', 'hf', 4, '8-12', 1, 'Espalda alta en el banco, empuja la cadera hasta alinear tronco y muslos, mentón al pecho.'],
  ['Peso muerto convencional', 'isquios_gluteo', 'a', 'fh', 4, '4-6', 1, 'Barra pegada a las piernas, espalda neutra, empuja el suelo y bloquea con glúteos.'],
  // Hombros
  ['Elevaciones laterales', 'hombros', 'b', 'hp', 3, '12-15', 0, 'Codos ligeramente flexionados, sube hasta la altura del hombro sin encogerlos.'],
  ['Elevaciones frontales', 'hombros', 'b', 'h', 3, '12', 0, 'Sube alternando hasta la altura de los ojos, sin balancear el torso.'],
  ['Pájaros para deltoide posterior', 'hombros', 'b', 'hp', 3, '12-15', 0, 'Inclina el torso, abre los brazos como alas apretando entre escápulas.'],
  ['Face pull en polea', 'hombros', 'b', 'phf', 3, '12-15', 0, 'Polea alta con cuerda, tira hacia la cara abriendo los codos; protege el hombro.'],
  ['Press militar con mancuernas sentado', 'hombros', 'm', 'hf', 3, '8-12', 1, 'Espalda apoyada, empuja en vertical hasta casi extender y baja a la altura de las orejas.'],
  ['Press militar con barra de pie', 'hombros', 'a', 'fh', 4, '5-8', 1, 'Glúteos y abdomen apretados, empuja la barra sobre la cabeza sin arquear la espalda.'],
  // Brazos
  ['Curl de bíceps con mancuernas', 'brazos', 'b', 'phf', 3, '10-12', 0, 'Codos pegados al torso, sube girando la muñeca y baja en 3 segundos.'],
  ['Curl martillo', 'brazos', 'b', 'hf', 3, '10-12', 0, 'Agarre neutro (palmas enfrentadas), sin balancear el cuerpo.'],
  ['Extensión de tríceps en polea', 'brazos', 'b', 'phf', 3, '10-15', 0, 'Codos fijos junto al cuerpo, extiende completo y vuelve lento.'],
  ['Fondos en banco para tríceps', 'brazos', 'm', 'ph', 3, '8-12', 1, 'Manos en el borde del banco, baja hasta 90° en el codo y sube sin encoger hombros.'],
  ['Press francés con barra Z', 'brazos', 'm', 'hf', 3, '8-12', 0, 'Codos apuntando al techo, baja la barra a la frente y extiende sin abrirlos.'],
  ['Curl con barra Z', 'brazos', 'm', 'hf', 3, '8-12', 0, 'Espalda recta, sube sin impulso y contrae arriba un segundo.'],
  // Core
  ['Plancha frontal', 'core', 'b', 'phf', 3, '30-45 s', 0, 'Codos bajo hombros, cuerpo recto de cabeza a talones, abdomen y glúteos apretados.'],
  ['Dead bug', 'core', 'b', 'pf', 3, '10 por lado', 0, 'Lumbar pegada al suelo, extiende brazo y pierna contrarios lentamente.'],
  ['Crunch abdominal', 'core', 'b', 'ph', 3, '15-20', 0, 'Sube solo los omóplatos, mirada al techo, exhala al contraer.'],
  ['Plancha lateral', 'core', 'b', 'fp', 3, '25-30 s por lado', 0, 'Apoya el antebrazo, eleva la cadera y mantén el cuerpo alineado.'],
  ['Bicicleta abdominal', 'core', 'm', 'p', 3, '20 totales', 0, 'Lleva el codo hacia la rodilla contraria con giro de tronco controlado.'],
  ['Elevación de piernas colgado', 'core', 'a', 'hf', 3, '10-12', 0, 'Sube las piernas con control, sin balancearte, curvando la pelvis arriba.'],
  // Cardio / full body
  ['Caminata rápida inclinada', 'fullbody', 'b', 'p', 1, '20-30 min', 0, 'Banda con 5-8% de inclinación, ritmo en el que puedas hablar entrecortado.'],
  ['Bicicleta estática', 'fullbody', 'b', 'p', 1, '20-30 min', 0, 'Asiento a la altura de la cadera, cadencia constante, espalda recta.'],
  ['Elíptica', 'fullbody', 'b', 'p', 1, '20-25 min', 0, 'Postura erguida, empuja y jala con brazos y piernas a ritmo moderado.'],
  ['Remo ergómetro', 'fullbody', 'm', 'pf', 1, '15-20 min', 0, 'Empuja con piernas, luego tronco, luego brazos; vuelve en orden inverso.'],
  ['Kettlebell swing', 'fullbody', 'm', 'pf', 3, '15', 1, 'Bisagra de cadera, el impulso viene de los glúteos, no de los brazos.'],
  ['Saltar la cuerda', 'fullbody', 'a', 'p', 4, '40 s', 0, 'Saltos pequeños sobre la punta del pie, muñecas haciendo el giro.'],
  ['Burpees', 'fullbody', 'a', 'p', 4, '10-12', 1, 'Pecho al suelo, salta y aplaude arriba; ajusta el ritmo para mantener la técnica.'],
  ['Thruster con mancuernas', 'fullbody', 'a', 'pf', 3, '10', 1, 'Sentadilla profunda y, al subir, empuja las mancuernas sobre la cabeza en un solo movimiento.']
];
const BANCO_EJERCICIOS_BASE = _EJ.map((e, i) => ({
  id: 'b' + i, nombre: e[0], grupo: e[1], impacto: e[2], enfoques: e[3],
  series: e[4], reps: e[5], compuesto: !!e[6], tecnica: e[7], base: true
}));

// [nombre, categoría, kcal, proteína g, carbohidrato g, grasa g, IMC apto (b=bajo, n=normal, s=sobrepeso, o=obesidad), objetivos (p=perder, g=ganar peso, m=masa muscular, t=mantener)]
const _AL = [
  // Desayunos
  ['Arepa integral con huevo revuelto y aguacate', 'desayuno', 430, 20, 38, 22, 'bn', 'tmg'],
  ['Avena cocida con leche descremada, fresas y chía', 'desayuno', 360, 17, 52, 9, 'bnso', 'ptm'],
  ['Huevos pericos con arepa pequeña', 'desayuno', 340, 18, 28, 17, 'nso', 'pt'],
  ['Tostadas integrales con aguacate y huevo pochado', 'desayuno', 375, 17, 32, 20, 'bnso', 'ptm'],
  ['Batido de banano, avena, leche y mantequilla de maní', 'desayuno', 555, 24, 70, 20, 'bn', 'gm'],
  ['Pancakes de avena y banano con yogur griego', 'desayuno', 460, 26, 62, 12, 'bn', 'gmt'],
  ['Yogur griego con granola y frutas', 'desayuno', 335, 20, 44, 9, 'bnso', 'ptm'],
  ['Changua ligera con huevo y pan integral', 'desayuno', 280, 15, 28, 12, 'nso', 'pt'],
  ['Smoothie verde de espinaca, piña y proteína', 'desayuno', 255, 25, 30, 4, 'nso', 'p'],
  ['Omelette de claras con espinaca y champiñones y fruta', 'desayuno', 240, 24, 18, 8, 'nso', 'p'],
  ['Arepa de choclo con queso fresco y huevo', 'desayuno', 570, 24, 55, 28, 'bn', 'gm'],
  ['Tazón de papaya, yogur natural y nueces', 'desayuno', 260, 12, 30, 10, 'nso', 'pt'],
  // Almuerzos
  ['Pechuga a la plancha con arroz integral y ensalada', 'almuerzo', 450, 42, 48, 10, 'bnso', 'ptm'],
  ['Salmón al horno con quinoa y brócoli', 'almuerzo', 510, 38, 40, 22, 'bnso', 'ptm'],
  ['Bandeja paisa ligera (fríjoles, arroz, carne magra, huevo, aguacate)', 'almuerzo', 750, 45, 80, 28, 'bn', 'g'],
  ['Sopa de lentejas con pollo desmechado y arroz', 'almuerzo', 480, 35, 62, 10, 'bnso', 'ptm'],
  ['Sudado de pollo con papa criolla y ensalada', 'almuerzo', 435, 38, 44, 12, 'bnso', 'ptm'],
  ['Tilapia al vapor con yuca y ensalada de repollo', 'almuerzo', 405, 36, 45, 9, 'nso', 'pt'],
  ['Ensalada grande de pollo, garbanzos y aguacate', 'almuerzo', 425, 36, 30, 18, 'nso', 'pt'],
  ['Bistec magro con arroz, fríjoles y plátano', 'almuerzo', 665, 44, 82, 18, 'bn', 'gm'],
  ['Pasta integral con atún y vegetales', 'almuerzo', 475, 34, 62, 10, 'bns', 'tmg'],
  ['Ajiaco ligero con pollo, papas y mazorca (sin crema)', 'almuerzo', 435, 36, 52, 9, 'bnso', 'ptm'],
  ['Lomo de cerdo magro con puré de papa y ensalada', 'almuerzo', 505, 40, 55, 14, 'bns', 'tm'],
  ['Bowl de arroz, pollo, fríjoles negros y vegetales', 'almuerzo', 695, 50, 90, 15, 'bn', 'gm'],
  ['Wrap integral de pavo y verduras con crema de zapallo', 'almuerzo', 415, 32, 45, 12, 'nso', 'pt'],
  // Cenas
  ['Tortilla de 3 huevos con vegetales y tostada integral', 'cena', 365, 24, 22, 20, 'bnso', 'ptm'],
  ['Crema de zapallo con pollo desmechado', 'cena', 305, 28, 30, 8, 'nso', 'pt'],
  ['Pescado a la plancha con ensalada y camote', 'cena', 365, 34, 35, 10, 'bnso', 'ptm'],
  ['Pollo salteado con verduras y arroz integral', 'cena', 375, 36, 38, 9, 'bnso', 'ptm'],
  ['Ensalada de atún, huevo y aguacate', 'cena', 375, 32, 12, 22, 'nso', 'pt'],
  ['Sopa de verduras con carne magra', 'cena', 305, 30, 28, 8, 'nso', 'p'],
  ['Hamburguesa casera de carne magra con papa al horno', 'cena', 600, 40, 60, 22, 'bn', 'gm'],
  ['Salmón con puré de papa y espárragos', 'cena', 550, 38, 45, 24, 'bn', 'gmt'],
  ['Pasta con pollo y salsa de tomate natural', 'cena', 565, 40, 70, 14, 'bn', 'gm'],
  ['Rollitos de pollo y queso bajo en grasa con ensalada', 'cena', 300, 38, 10, 12, 'nso', 'p'],
  ['Arepa rellena de pollo y aguacate', 'cena', 500, 32, 48, 20, 'bns', 'tmg'],
  // Snacks
  ['Manzana con mantequilla de maní', 'snack', 200, 4, 28, 8, 'bnso', 'ptmg'],
  ['Yogur griego natural con frutos rojos', 'snack', 145, 15, 14, 3, 'nso', 'pt'],
  ['Nueces y almendras (30 g)', 'snack', 210, 6, 6, 18, 'bns', 'tmg'],
  ['Dos huevos cocidos con zanahoria', 'snack', 165, 13, 6, 10, 'bnso', 'ptm'],
  ['Batido de proteína con leche y banano', 'snack', 335, 30, 40, 6, 'bn', 'gm'],
  ['Palitos de apio y zanahoria con hummus', 'snack', 150, 5, 14, 8, 'nso', 'p'],
  ['Sándwich de pavo y queso en pan integral', 'snack', 280, 22, 30, 8, 'bn', 'gmt'],
  ['Fruta picada con queso fresco', 'snack', 175, 8, 24, 5, 'bnso', 'pt'],
  ['Barra de avena casera con banano', 'snack', 225, 6, 34, 7, 'bn', 'gmt'],
  ['Queso cottage con piña', 'snack', 140, 14, 12, 4, 'nso', 'p'],
  ['Mix de frutos secos, pasas y chocolate oscuro', 'snack', 360, 8, 32, 22, 'b', 'g']
];
const BANCO_ALIMENTOS_BASE = _AL.map((a, i) => ({
  id: 'a' + i, nombre: a[0], categoria: a[1], kcal: a[2], p: a[3], c: a[4], g: a[5],
  imc: a[6], objetivos: a[7], base: true
}));

// Entradas agregadas por el admin (se guardan en el navegador)
function leerExtra(clave) {
  try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (e) { return []; }
}
function getEjercicios() { return BANCO_EJERCICIOS_BASE.concat(leerExtra('bancoEjerciciosExtra')); }
function getAlimentos() { return BANCO_ALIMENTOS_BASE.concat(leerExtra('bancoAlimentosExtra')); }
