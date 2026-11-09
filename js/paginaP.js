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

  // 4. Calendario de actividad: un día por cada día de la rutina real del usuario.
  //    El estado sale de los ejercicios que marcó en "Ver Mi Rutina" (ver seguimiento.js).
  const calendario = document.getElementById('calendarioContainer');
  const rango = document.getElementById('rangoSemana');
  if (rango) rango.textContent = Seguimiento.textoSemana();

  const ESTADOS = {
    completado: { fondo: 'rgba(74, 222, 128, 0.15)', borde: '#4ade80', clase: 'is-success', texto: () => 'Completado' },
    progreso:   { fondo: 'rgba(250, 204, 21, 0.12)', borde: '#facc15', clase: 'is-warning', texto: d => 'En progreso ' + d.hechos + '/' + d.total },
    pendiente:  { fondo: 'rgba(255, 255, 255, 0.05)', borde: 'rgba(255, 255, 255, 0.1)', clase: 'is-dark', texto: () => 'Pendiente' }
  };

  function pintarCalendario(rutina) {
    const dias = Seguimiento.estadoDias(rutina);
    const col = dias.length <= 3 ? 'is-4' : dias.length === 4 ? 'is-3' : 'is-one-fifth';
    calendario.innerHTML = dias.map((d, i) => {
      const e = ESTADOS[d.estado];
      return '<div class="column ' + col + '">' +
        '<div class="box p-3 has-text-centered" id="dia-' + (i + 1) + '" style="background:' + e.fondo + '; border:1px solid ' + e.borde + '; border-radius:12px; color:#fff;">' +
        '<p class="is-size-7 has-text-grey-light">DÍA ' + (i + 1) + '</p>' +
        '<p class="is-size-6 my-1" id="nombre-rutina-' + (i + 1) + '">' + esc(d.nombre) + '</p>' +
        '<span class="tag ' + e.clase + ' is-small" id="estado-dia-' + (i + 1) + '">' + e.texto(d) + '</span>' +
        '</div></div>';
    }).join('');
  }

  const perfil = obtenerPerfil();
  if (!perfil) {
    calendario.innerHTML = '<div class="column is-12"><p class="is-size-7 has-text-grey-light">' +
      'Completa tu valoración inicial para ver tu calendario. <a href="evaluacion.html">Ir a la valoración</a></p></div>';
  } else {
    Seguimiento.obtenerRutina(perfil).then(pintarCalendario);
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
