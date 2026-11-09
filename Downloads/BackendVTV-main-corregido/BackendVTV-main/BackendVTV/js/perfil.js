document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Obtener datos guardados en LocalStorage (Registro y Valoración)
  const nombre = localStorage.getItem('usuarioNombre') || 'Usuario Fitness';
  const correo = localStorage.getItem('usuarioCorreo') || 'usuario@email.com';
  const fechaNac = localStorage.getItem('usuarioFechaNac') || '';
  const peso = parseFloat(localStorage.getItem('usuarioPeso')) || 0;
  const altura = parseFloat(localStorage.getItem('usuarioAltura')) || 0;
  const objetivoCod = localStorage.getItem('usuarioObjetivo') || 'No especificado';

  // 2. Renderizar datos básicos
  document.getElementById('perfilNombre').innerText = nombre;
  document.getElementById('perfilCorreo').innerText = correo;
  document.getElementById('perfilPeso').innerText = peso ? `${peso} kg` : '--';
  document.getElementById('perfilAltura').innerText = altura ? `${altura} cm` : '--';

  // Mapear código de objetivo a texto legible
  const mapaObjetivos = {
    'perder_peso': 'Perder peso',
    'ganar_peso': 'Ganar peso',
    'ganar_masa_muscular': 'Ganar masa muscular',
    'mantener_peso': 'Mantener peso'
  };
  document.getElementById('perfilObjetivo').innerText = mapaObjetivos[objetivoCod] || objetivoCod;

  // 3. Calcular Edad exactas a partir de la fecha de nacimiento
  if (fechaNac) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    document.getElementById('perfilEdad').innerText = `${edad} años`;
  } else {
    document.getElementById('perfilEdad').innerText = '--';
  }

  // 4. Calcular IMC e interpretar el estado de salud
  if (peso > 0 && altura > 0) {
    const alturaMetros = altura / 100;
    const imc = (peso / (alturaMetros * alturaMetros)).toFixed(1);
    document.getElementById('perfilIMC').innerText = imc;

    const badgeIMC = document.getElementById('perfilEstadoIMC');
    if (imc < 18.5) {
      badgeIMC.innerText = 'Bajo Peso';
      badgeIMC.className = 'tag is-warning is-light is-rounded ml-2';
    } else if (imc >= 18.5 && imc <= 24.9) {
      badgeIMC.innerText = 'Peso Saludable';
      badgeIMC.className = 'tag is-success is-light is-rounded ml-2';
    } else if (imc >= 25 && imc <= 29.9) {
      badgeIMC.innerText = 'Sobrepeso';
      badgeIMC.className = 'tag is-warning is-light is-rounded ml-2';
    } else {
      badgeIMC.innerText = 'Obesidad';
      badgeIMC.className = 'tag is-danger is-light is-rounded ml-2';
    }
  }

  // 5. Función de Cerrar Sesión
  document.getElementById('btnCerrarSesion').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      sessionStorage.clear();
      window.location.href = 'login.html';
    }
  });

});

