document.getElementById('evaluacionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const fechaNac = document.getElementById('fechaNacimiento').value.trim();
  const peso = parseFloat(document.getElementById('peso').value);
  const altura = parseFloat(document.getElementById('altura').value);
  const objetivo = document.getElementById('objetivo').value;

  if (!fechaNac) {
    mostrarAlerta("Por favor, selecciona tu fecha de nacimiento.", "danger");
    return;
  }

  if (isNaN(peso) || peso <= 0) {
    mostrarAlerta("Por favor, ingresa un peso válido en kg.", "danger");
    return;
  }

  if (isNaN(altura) || altura <= 50 || altura > 250) {
    mostrarAlerta("Por favor, ingresa una altura válida en cm.", "danger");
    return;
  }

  if (!objetivo) {
    mostrarAlerta("Por favor, selecciona tu objetivo principal.", "danger");
    return;
  }

  // Guardar datos en LocalStorage
  localStorage.setItem('usuarioFechaNac', fechaNac);
  localStorage.setItem('usuarioPeso', peso);
  localStorage.setItem('usuarioAltura', altura);
  localStorage.setItem('usuarioObjetivo', objetivo);
  localStorage.setItem('planAsignado', 'true');
  sessionStorage.setItem('infoGuardada', 'true');

  mostrarAlerta("¡Evaluación completada con éxito! Redirigiendo...", "success");

  setTimeout(function() {
    window.location.href = 'paginaP.html';
  }, 1200);
});