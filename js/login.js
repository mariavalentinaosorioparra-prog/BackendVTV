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

  if (correo === '' || !emailRegex.test(correo)) {
    mostrarAlerta("Por favor, ingresa un correo electrónico válido.", "danger");
    return;
  }

  if (password === '') {
    mostrarAlerta("Por favor, ingresa tu contraseña.", "danger");
    return;
  }

  // CAMBIADO: ahora se verifica contra la BD por medio del PHP
  const datos = new FormData();
  datos.append('loginCorreo', correo);
  datos.append('loginPassword', password);

  fetch('../php/login.php', { method: 'POST', body: datos })
  .then(res => res.json())
  .then(data => {
    if (!data.ok) {
      mostrarAlerta(data.mensaje, "danger");
      return;
    }

    // Datos de la cuenta
    localStorage.setItem('usuarioNombre', data.nombre);
    localStorage.setItem('usuarioCorreo', data.correo);
    localStorage.setItem('usuarioActivo', data.correo);
    localStorage.setItem('esAdmin', data.es_admin ? 'true' : 'false');
    sessionStorage.setItem('sesionIniciada', 'true');

    // Administrador
    if (data.es_admin) {
      mostrarAlerta("¡Bienvenido, Administrador! Redirigiendo...", "success");
      setTimeout(() => { window.location.href = 'adm.html'; }, 1200);
      return;
    }

    // Cliente: restaurar su evaluación desde la BD (sirve en cualquier navegador)
    const ev = data.evaluacion;
    if (ev) {
      localStorage.setItem('usuarioFechaNac', ev.fechaNacimiento);
      localStorage.setItem('usuarioPeso', ev.peso);
      localStorage.setItem('usuarioAltura', ev.altura);
      localStorage.setItem('usuarioObjetivo', ev.objetivo);
      localStorage.setItem('usuarioSexo', ev.sexo || 'masculino');
      localStorage.setItem('usuarioNivel', ev.nivel || 'principiante');
      localStorage.setItem('planAsignado', 'true');
    } else {
      localStorage.setItem('planAsignado', 'false');
    }

    mostrarAlerta("¡Inicio de sesión exitoso! Verificando tu perfil...", "success");

    setTimeout(() => {
      window.location.href = ev ? 'paginaP.html' : 'evaluacion.html';
    }, 1200);
  })
  .catch(err => {
    console.error('Error al conectar con el PHP:', err);
    mostrarAlerta("No se pudo conectar con el servidor.", "danger");
  });
});