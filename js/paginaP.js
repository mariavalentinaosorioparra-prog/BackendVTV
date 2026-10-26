document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Validar sesión activa
  const sesionIniciada = sessionStorage.getItem('sesionIniciada');
  if (sesionIniciada !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  // 2. Mostrar Nombre del Usuario
  const nombreUsuario = localStorage.getItem('usuarioNombre') || 'Usuario';
  const elementoSaludo = document.getElementById('saludoUsuario');
  if (elementoSaludo) {
    elementoSaludo.innerText = `¡Hola, ${nombreUsuario}! 👋`;
  }

  // 3. Calcular y mostrar el IMC basado en los datos de la valoración
  const peso = parseFloat(localStorage.getItem('usuarioPeso'));
  const alturaCm = parseFloat(localStorage.getItem('usuarioAltura'));
  const infoImc = document.getElementById('infoImc');

  if (peso && alturaCm && infoImc) {
    const alturaM = alturaCm / 100;
    const imc = (peso / (alturaM * alturaM)).toFixed(1);
    
    let clasificacion = "Peso Saludable";
    if (imc < 18.5) clasificacion = "Bajo peso";
    else if (imc >= 25 && imc < 30) clasificacion = "Sobrepeso";
    else if (imc >= 30) clasificacion = "Obesidad";

    infoImc.innerHTML = `IMC Calculado: <strong>${imc} (${clasificacion})</strong>`;
  }

  // 4. Cargar nombres personalizados de rutinas y actualizar el Calendario de Actividad
  const sesionesCompletadas = parseInt(localStorage.getItem('sesionesCompletadas')) || 0;

  for (let i = 1; i <= 4; i++) {
    const cardDia = document.getElementById(`dia-${i}`);
    const spanEstado = document.getElementById(`estado-dia-${i}`);
    const labelRutina = document.getElementById(`nombre-rutina-${i}`);

    // Si el usuario personalizó el nombre o tipo de rutina para este día, lo cargamos
    const rutinaPersonalizada = localStorage.getItem(`rutinaDia_${i}`);
    if (rutinaPersonalizada && labelRutina) {
      labelRutina.innerText = rutinaPersonalizada;
    }

    if (!cardDia) continue;

    // Permite verificar si el día fue completado de forma secuencial o individual
    const diaCompletado = localStorage.getItem(`diaCompletado_${i}`) === 'true' || i <= sesionesCompletadas;

    if (diaCompletado) {
      cardDia.style.background = 'rgba(74, 222, 128, 0.15)';
      cardDia.style.border = '1px solid #4ade80';
      if (spanEstado) {
        spanEstado.className = 'tag is-success is-small';
        spanEstado.innerText = 'Completado';
      }
    } else {
      cardDia.style.background = 'rgba(255, 255, 255, 0.05)';
      cardDia.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      if (spanEstado) {
        spanEstado.className = 'tag is-dark is-small';
        spanEstado.innerText = 'Pendiente';
      }
    }
  }

  // 5. Notificación flotante si viene de la valoración
  if (sessionStorage.getItem('infoGuardada') === 'true') {
    mostrarAlerta("¡Tu valoración y plan se han cargado correctamente!", "success");
    sessionStorage.removeItem('infoGuardada');
  }

});

// Función para verificar si el usuario ya realizó la valoración antes de entrar a Rutinas/Nutrición
function verificarAsignacion(tipo) {
  const planAsignado = localStorage.getItem('planAsignado') === 'true';

  if (planAsignado) {
    if (tipo === 'rutina') {
      window.location.href = 'Rutinas.html';
    } else if (tipo === 'nutricion') {
      window.location.href = 'planNasignado.html';
    }
  } else {
    mostrarAlerta("Debes completar tu valoración inicial primero.", "warning");
    setTimeout(() => {
      window.location.href = 'evaluacion.html';
    }, 1500);
  }
}