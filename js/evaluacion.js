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

  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }

  if (edad < 18) {
    mostrarAlerta("Debes ser mayor de 18 años para utilizar esta aplicación fitness.", "warning");
    return;
  }

  // --- 2. VALIDACIÓN DE PESO ---
  if (isNaN(peso) || peso < 30 || peso > 300) {
    mostrarAlerta("Por favor, ingresa un peso válido entre 30 kg y 300 kg.", "danger");
    return;
  }

  // --- 3. VALIDACIÓN DE ALTURA ---
  if (isNaN(altura) || altura < 100 || altura > 250) {
    mostrarAlerta("Por favor, ingresa una altura válida en centímetros (entre 100 cm y 250 cm).", "danger");
    return;
  }

  // --- 4. VALIDACIÓN DE SEXO, NIVEL Y OBJETIVO ---
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

  // AGREGADO: enviar al PHP
  const datos = new FormData();
  datos.append('fechaNacimiento', fechaNacInput);
  datos.append('peso', peso);
  datos.append('altura', altura);
  datos.append('objetivo', objetivo);
  datos.append('sexo', sexo);
  datos.append('nivel', nivel);

  fetch('../php/evaluacion.php', { method: 'POST', body: datos })
  .then(res => res.json())
  .then(data => {
    if (!data.ok) {
      mostrarAlerta(data.mensaje, "danger");
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
    localStorage.removeItem('rutinaHechos');
    sessionStorage.setItem('infoGuardada', 'true');

    mostrarAlerta("¡Valoración validada y guardada con éxito!", "success");

    setTimeout(function() {
      window.location.href = 'paginaP.html';
    }, 1200);
  })
  .catch(err => {
    console.error('Error al conectar con el PHP:', err);
    mostrarAlerta("No se pudo conectar con el servidor.", "danger");
  });
});