document.getElementById('registroForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const nombre = document.getElementById('regNombre').value.trim();
  const correo = document.getElementById('regCorreo').value.trim();
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nombre || nombre.length < 3) {
    mostrarAlerta("Ingresa tu nombre completo (mínimo 3 caracteres).", "danger");
    return;
  }

  if (!correo || !emailRegex.test(correo)) {
    mostrarAlerta("Ingresa un correo electrónico válido.", "danger");
    return;
  }

  if (!password || password.length < 6) {
    mostrarAlerta("La contraseña debe tener al menos 6 caracteres.", "danger");
    return;
  }

  if (password !== passwordConfirm) {
    mostrarAlerta("Las contraseñas no coinciden.", "danger");
    return;
  }

  // Guardar datos básicos en localStorage
  localStorage.setItem('usuarioNombre', nombre);
  localStorage.setItem('usuarioCorreo', correo);
  localStorage.setItem('usuarioPassword', password);
  localStorage.setItem('usuarioActivo', correo);
  sessionStorage.setItem('sesionIniciada', 'true');

  // --- VERIFICAR SI ES ADMINISTRADOR (@fitapp.com) ---
  const esAdmin = correo.endsWith('@fitapp.com');

  if (esAdmin) {
    localStorage.setItem('esAdmin', 'true');
    localStorage.setItem('planAsignado', 'false'); // Los admins no requieren plan ni valoración

    mostrarAlerta("¡Cuenta de Administrador registrada con éxito! Redirigiendo...", "success");

    setTimeout(() => {
      window.location.href = 'adm.html'; // Directo al panel de gestión
    }, 1500);
    return;
  }

  // --- FLUJO PARA USUARIO NORMAL (CLIENTE) ---
  localStorage.setItem('esAdmin', 'false');
  localStorage.setItem('planAsignado', 'false'); // Requerirá valoración inicial

  mostrarAlerta("¡Registro exitoso! Redirigiendo a tu valoración inicial...", "success");

  setTimeout(() => {
    window.location.href = 'evaluacion.html'; // Los clientes normales sí van a evaluación
  }, 1500);
});