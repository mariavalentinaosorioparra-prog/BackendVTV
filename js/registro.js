document.getElementById('registroForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const nombre = document.getElementById('regNombre').value.trim();
  const correo = document.getElementById('regCorreo').value.trim();
  const password = document.getElementById('regPassword').value;
  // acepta cualquiera de los dos ids que pueda tener el HTML
  const campoConfirmar = document.getElementById('regPasswordConfirmar') || document.getElementById('regPasswordConfirm');
  const passwordConfirm = campoConfirmar.value;
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

  // AGREGADO: enviar al PHP
  const datos = new FormData();
  datos.append('regNombre', nombre);
  datos.append('regCorreo', correo);
  datos.append('regPassword', password);
  datos.append('regPasswordConfirmar', passwordConfirm);

  fetch('../php/registro.php', { method: 'POST', body: datos })
  .then(res => res.json())
  .then(data => {
    if (!data.ok) {
      mostrarAlerta(data.mensaje, "danger");
      return;
    }

    // Guardar datos básicos en localStorage
    localStorage.setItem('usuarioNombre', nombre);
    localStorage.setItem('usuarioCorreo', correo);
    localStorage.setItem('usuarioActivo', correo);
    sessionStorage.setItem('sesionIniciada', 'true');

    if (data.es_admin) {
      localStorage.setItem('esAdmin', 'true');
      localStorage.setItem('planAsignado', 'false');
      mostrarAlerta("¡Cuenta de Administrador registrada con éxito! Redirigiendo...", "success");
      setTimeout(() => { window.location.href = 'adm.html'; }, 1500);
      return;
    }

    localStorage.setItem('esAdmin', 'false');
    localStorage.setItem('planAsignado', 'false');
    mostrarAlerta("¡Registro exitoso! Redirigiendo a tu valoración inicial...", "success");
    setTimeout(() => { window.location.href = 'evaluacion.html'; }, 1500);
  })
  .catch(err => {
    console.error('Error al conectar con el PHP:', err);
    mostrarAlerta("No se pudo conectar con el servidor.", "danger");
  });
});