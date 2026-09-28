    // evaluacion


        document.getElementById('evaluacionForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Activa la bandera en la memoria del navegador
      sessionStorage.setItem('infoGuardada', 'true');
      
      // Redirige a la página principal
      window.location.href = 'paginaP.html'; 
    });
    

    document.getElementById('evaluacionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Obtener valores ingresados en los campos
  const inputs = this.querySelectorAll('input, select');
  const fechaNac = inputs[0].value;
  const peso = inputs[1].value;
  const altura = inputs[2].value;
  const objetivo = inputs[3].value;

  // Guardar datos en LocalStorage para que los consuma perfil.js y paginaP.js
  localStorage.setItem('usuarioFechaNac', fechaNac);
  localStorage.setItem('usuarioPeso', peso);
  localStorage.setItem('usuarioAltura', altura);
  localStorage.setItem('usuarioObjetivo', objetivo);
  localStorage.setItem('planAsignado', 'true');

  // Activar bandera para la notificación
  sessionStorage.setItem('infoGuardada', 'true');

  alert("¡Información guardada correctamente!");

  // Redirigir a la página principal
  window.location.href = 'paginaP.html';
});