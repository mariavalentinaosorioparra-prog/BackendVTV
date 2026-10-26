document.getElementById('evaluacionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const fechaNacInput = document.getElementById('fechaNacimiento').value.trim();
  const peso = parseFloat(document.getElementById('peso').value);
  const altura = parseFloat(document.getElementById('altura').value);
  const objetivo = document.getElementById('objetivo').value;
  const sexo = document.getElementById('sexo').value;
  const nivel = document.getElementById('nivel').value;

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

  if (!sexo) {
    mostrarAlerta("Selecciona tu sexo (se usa para calcular tus calorías).", "danger");
    return;
  }

  if (!nivel) {
    mostrarAlerta("Selecciona tu nivel de entrenamiento.", "danger");
    return;
  }

  if (!objetivo) {
    mostrarAlerta("Por favor, selecciona tu objetivo principal.", "danger");
    return;
  }

  // --- GUARDAR DATOS SI TODO ES CORRECTO ---
  localStorage.setItem('usuarioFechaNac', fechaNacInput);
  localStorage.setItem('usuarioPeso', peso);
  localStorage.setItem('usuarioAltura', altura);
  localStorage.setItem('usuarioObjetivo', objetivo);
  localStorage.setItem('usuarioSexo', sexo);
  localStorage.setItem('usuarioNivel', nivel);
  localStorage.setItem('planAsignado', 'true');
  localStorage.removeItem('rutinaHechos'); // la rutina nueva reinicia el seguimiento
  sessionStorage.setItem('infoGuardada', 'true');

  mostrarAlerta("¡Valoración validada y guardada con éxito!", "success");

  setTimeout(function() {
    window.location.href = 'paginaP.html';
  }, 1200);
});