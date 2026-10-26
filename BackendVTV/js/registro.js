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

  localStorage.setItem('usuarioNombre', nombre);
  localStorage.setItem('usuarioCorreo', correo);
  localStorage.setItem('usuarioPassword', password);

  mostrarAlerta("¡Registro exitoso! Redirigiendo...", "success");

  setTimeout(() => {
    window.location.href = 'evaluacion.html';
  }, 1500);
});