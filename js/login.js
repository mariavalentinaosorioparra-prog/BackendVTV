document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const inputCorreo = document.getElementById('loginCorreo');
  const inputPassword = document.getElementById('loginPassword');

  if (!inputCorreo || !inputPassword) {
    mostrarAlerta("Error en la estructura del formulario.", "danger");
    return;
  }

  const correo = inputCorreo.value.trim();
  const password = inputPassword.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validaciones básicas de campos
  if (correo === '' || !emailRegex.test(correo)) {
    mostrarAlerta("Por favor, ingresa un correo electrónico válido.", "danger");
    return;
  }

  if (password === '') {
    mostrarAlerta("Por favor, ingresa tu contraseña.", "danger");
    return;
  }

  // --- 1. VERIFICAR SI ES ADMINISTRADOR (@fitapp.com) ---
  const esAdmin = correo.endsWith('@fitapp.com');

  if (esAdmin) {
    // Si es administrador, permitimos la contraseña genérica 'admin123' o la contraseña que haya registrado
    const passwordAdminGuardada = localStorage.getItem('usuarioPassword') || 'admin123';

    if (password !== 'admin123' && password !== passwordAdminGuardada) {
      mostrarAlerta("Contraseña de administrador incorrecta.", "danger");
      return;
    }

    localStorage.setItem('esAdmin', 'true');
    localStorage.setItem('usuarioActivo', correo);
    sessionStorage.setItem('sesionIniciada', 'true');

    mostrarAlerta("¡Bienvenido, Administrador! Redirigiendo...", "success");

    setTimeout(function() {
      window.location.href = 'adm.html';
    }, 1200);
    return;
  }

  // --- 2. RECUPERAR DATOS DEL USUARIO REGISTRADO (CLIENTE NORMAL) ---
  const correoGuardado = localStorage.getItem('usuarioCorreo');
  const passwordGuardada = localStorage.getItem('usuarioPassword');
  const evaluacionRealizada = localStorage.getItem('planAsignado');

  if (!correoGuardado || !passwordGuardada) {
    mostrarAlerta("No hay ninguna cuenta registrada. Por favor, regístrate primero.", "warning");
    setTimeout(function() {
      window.location.href = 'registro.html';
    }, 2000);
    return;
  }

  // Verificar credenciales del usuario normal
  if (correo !== correoGuardado || password !== passwordGuardada) {
    mostrarAlerta("Correo o contraseña incorrectos.", "danger");
    return;
  }

  // --- 3. SESIÓN EXITOSA PARA USUARIO NORMAL ---
  localStorage.setItem('esAdmin', 'false');
  localStorage.setItem('usuarioActivo', correo);
  sessionStorage.setItem('sesionIniciada', 'true');

  mostrarAlerta("¡Inicio de sesión exitoso! Verificando tu perfil...", "success");

  // --- LÓGICA DE SALTO DE VALORACIÓN ---
  setTimeout(function() {
    if (evaluacionRealizada === 'true') {
      window.location.href = 'paginaP.html';
    } else {
      window.location.href = 'evaluacion.html';
    }
  }, 1200);
});