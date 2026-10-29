document.getElementById('evaluacionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const fechaNacInput = document.getElementById('fechaNacimiento').value.trim();
  const peso = parseFloat(document.getElementById('peso').value);
  const altura = parseFloat(document.getElementById('altura').value);
  const objetivo = document.getElementById('objetivo').value;

  // --- 1. VALIDACIÓN DE FECHA DE NACIMIENTO Y EDAD (>= 18 AÑOS) ---
  if (!fechaNacInput) {
    mostrarAlerta("Por favor, selecciona tu fecha de nacimiento.", "danger");
    return;
  }

  const hoy = new Date();
  const fechaNacimiento = new Date(fechaNacInput);
  
  // Calcular la edad exacta
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }

  if (edad < 18) {
    mostrarAlerta("Debes ser mayor de 18 años para utilizar esta aplicación fitness.", "warning");
    return;
  }

  // --- 2. VALIDACIÓN DE PESO (Estándares mundiales lógicos: 30kg a 300kg) ---
  if (isNaN(peso) || peso < 30 || peso > 300) {
    mostrarAlerta("Por favor, ingresa un peso válido entre 30 kg y 300 kg.", "danger");
    return;
  }

  // --- 3. VALIDACIÓN DE ALTURA (Estándares mundiales lógicos: 100cm a 250cm) ---
  if (isNaN(altura) || altura < 100 || altura > 250) {
    mostrarAlerta("Por favor, ingresa una altura válida en centímetros (entre 100 cm y 250 cm).", "danger");
    return;
  }

  // --- 4. VALIDACIÓN DE OBJETIVO ---
  if (!objetivo) {
    mostrarAlerta("Por favor, selecciona tu objetivo principal.", "danger");
    return;
  }

  // --- GUARDAR DATOS SI TODO ES CORRECTO ---
  localStorage.setItem('usuarioFechaNac', fechaNacInput);
  localStorage.setItem('usuarioPeso', peso);
  localStorage.setItem('usuarioAltura', altura);
  localStorage.setItem('usuarioObjetivo', objetivo);
  localStorage.setItem('planAsignado', 'true');
  sessionStorage.setItem('infoGuardada', 'true');

  mostrarAlerta("¡Valoración validada y guardada con éxito!", "success");

  setTimeout(function() {
    window.location.href = 'paginaP.html';
  }, 1200);
});

document.addEventListener('DOMContentLoaded', function() {
  const formEvaluacion = document.getElementById('formEvaluacion');

  if (!formEvaluacion) return;

  formEvaluacion.addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. Capturar los valores del formulario de evaluación
    const pesoInput = document.getElementById('evalPeso');
    const alturaInput = document.getElementById('evalAltura');
    const objetivoSelect = document.getElementById('evalObjetivo');

    if (!pesoInput || !alturaInput || !objetivoSelect) {
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta("Error en la estructura del formulario de evaluación.", "danger");
      }
      return;
    }

    const peso = parseFloat(pesoInput.value);
    const alturaCm = parseFloat(alturaInput.value);
    const objetivo = objetivoSelect.value;

    if (isNaN(peso) || isNaN(alturaCm) || peso <= 0 || alturaCm <= 0) {
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta("Por favor, ingresa un peso y una altura válidos.", "warning");
      }
      return;
    }

    // 2. Guardar datos biométricos y objetivo en el localStorage
    localStorage.setItem('usuarioPeso', peso);
    localStorage.setItem('usuarioAltura', alturaCm);
    localStorage.setItem('usuarioObjetivo', objetivo);

    // 3. Ejecutar la función de asignación automática de rutinas según el IMC y el Banco del Administrador
    generarRutinaAutomaticaPorIMC(peso, alturaCm, objetivo);

    // 4. Marcar que la evaluación ya fue realizada para que el login no vuelva a pedirla
    localStorage.setItem('planAsignado', 'true');

    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta("¡Valoración guardada y plan generado con éxito!", "success");
    }

    // 5. Redirigir al Dashboard principal tras un breve retraso
    setTimeout(() => {
      window.location.href = 'paginaP.html';
    }, 1500);
  });
});

// Función inteligente que conecta el Banco del Admin con los datos del usuario
function generarRutinaAutomaticaPorIMC(peso, alturaCm, objetivo) {
  const alturaM = alturaCm / 100;
  const imc = peso / (alturaM * alturaM);

  // Recuperar el Banco de Ejercicios creado por el Administrador
  const bancoEjercicios = JSON.parse(localStorage.getItem('bancoEjercicios')) || [
    { nombre: 'Flexiones de Pecho', grupo: 'Pecho' },
    { nombre: 'Sentadillas libres', grupo: 'Piernas' },
    { nombre: 'Plancha abdominal', grupo: 'Core' },
    { nombre: 'Burpees / Cardio', grupo: 'Cardio' }
  ];

  // Filtrar ejercicios del banco por categorías
  const ejerciciosPecho = bancoEjercicios.filter(e => e.grupo.toLowerCase().includes('pecho') || e.grupo.toLowerCase().includes('superior'));
  const ejerciciosPiernas = bancoEjercicios.filter(e => e.grupo.toLowerCase().includes('pierna') || e.grupo.toLowerCase().includes('inferior'));
  const ejerciciosCore = bancoEjercicios.filter(e => e.grupo.toLowerCase().includes('core') || e.grupo.toLowerCase().includes('abdominal'));
  const ejerciciosCardio = bancoEjercicios.filter(e => e.grupo.toLowerCase().includes('cardio') || e.grupo.toLowerCase().includes('hiit'));

  let enfoque = "General y Salud";
  if (imc >= 25 || objetivo === 'perder_peso') {
    enfoque = "Quema de Grasa (Cardio + Resistencia)";
  } else if (imc < 18.5 || objetivo === 'ganar_musculo') {
    enfoque = "Hipertrofia y Ganancia de Masa";
  }

  // Definir rutinas automáticas para los 4 días basándose en lo que hay en el banco
  const rutina1 = ejerciciosPecho.length > 0 ? [ejerciciosPecho[0].nombre, "Press de hombros"] : ["Flexiones de Pecho", "Press Militar"];
  const rutina2 = ejerciciosPiernas.length > 0 ? [ejerciciosPiernas[0].nombre, "Zancadas"] : ["Sentadillas libres", "Zancadas"];
  const rutina3 = ejerciciosCore.length > 0 ? [ejerciciosCore[0].nombre, "Elevación de piernas"] : ["Plancha abdominal", "Crunch"];
  const rutina4 = ejerciciosCardio.length > 0 ? [ejerciciosCardio[0].nombre, "Full Body Dinámico"] : ["Burpees / Cardio", "Flexiones"];

  // Guardar títulos y ejercicios específicos en localStorage para que 'rutinas.html' los lea
  localStorage.setItem('rutinaDia_1', `Día 1: Tren Superior (${enfoque})`);
  localStorage.setItem('rutinaDia_2', `Día 2: Tren Inferior (${enfoque})`);
  localStorage.setItem('rutinaDia_3', `Día 3: Core y Estabilidad`);
  localStorage.setItem('rutinaDia_4', `Día 4: Full Body & Cardio`);

  localStorage.setItem('ejercicios_Dia_1', JSON.stringify(rutina1));
  localStorage.setItem('ejercicios_Dia_2', JSON.stringify(rutina2));
  localStorage.setItem('ejercicios_Dia_3', JSON.stringify(rutina3));
  localStorage.setItem('ejercicios_Dia_4', JSON.stringify(rutina4));

  // Calcular calorías sugeridas para el plan nutricional automático
  let kcalSugeridas = 2000;
  if (objetivo === 'perder_peso') kcalSugeridas = 1700;
  if (objetivo === 'ganar_musculo') kcalSugeridas = 2600;

  // Guardar un plan nutricional por defecto basado en el objetivo
  const planNutricionalAuto = {
    calorias: kcalSugeridas,
    alimentos: ["Alimentos seleccionados del banco de nutrición"]
  };
  localStorage.setItem(`planNutricional_${localStorage.getItem('usuarioActivo')}`, JSON.stringify(planNutricionalAuto));
}