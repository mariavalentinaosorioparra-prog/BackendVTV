document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const inputCorreo = document.getElementById('loginCorreo');
  const inputPassword = document.getElementById('loginPassword');

  if (!inputCorreo || !inputPassword) {
    mostrarAlerta("Error en la estructura del formulario. Revisa los IDs.", "danger");
    return;
  }

  const correo = inputCorreo.value.trim();
  const password = inputPassword.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- VALIDACIÓN DE CAMPOS VACÍOS Y FORMATO ---

  if (correo === '') {
    mostrarAlerta("Por favor, ingresa tu correo electrónico.", "danger");
    return;
  }

  if (!emailRegex.test(correo)) {
    mostrarAlerta("Ingresa un correo electrónico válido.", "danger");
    return;
  }

  if (password === '') {
    mostrarAlerta("Por favor, ingresa tu contraseña.", "danger");
    return;
  }

  // --- VERIFICACIÓN DE CREDENCIALES ---

  const correoGuardado = localStorage.getItem('usuarioCorreo');
  const passwordGuardada = localStorage.getItem('usuarioPassword');

  if (!correoGuardado || !passwordGuardada) {
    mostrarAlerta("No hay ninguna cuenta registrada. Regístrate primero.", "warning");
    setTimeout(function() {
      window.location.href = 'registro.html';
    }, 1800);
    return;
  }

  if (correo !== correoGuardado || password !== passwordGuardada) {
    mostrarAlerta("Correo o contraseña incorrectos.", "danger");
    return;
  }

  // --- LOGIN EXITOSO ---

  sessionStorage.setItem('sesionIniciada', 'true');
  mostrarAlerta("¡Bienvenido! Redirigiendo a tu valoración inicial...", "success");

  // Redirección a Valoración Inicial
  setTimeout(function() {
    window.location.href = 'evaluacion.html';
  }, 1200);
});