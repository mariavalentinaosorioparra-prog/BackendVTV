document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Validar seguridad: Verificar que la sesión esté activa
  const sesionIniciada = sessionStorage.getItem('sesionIniciada');
  const correoActivo = localStorage.getItem('usuarioActivo');

  if (sesionIniciada !== 'true' || !correoActivo) {
    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta("Acceso denegado. Por favor, inicia sesión.", "danger");
    }
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }

  cargarRutinasUsuario();
});

// Función para renderizar las rutinas en el HTML
function cargarRutinasUsuario() {
  const contenedor = document.getElementById('contenedorRutinas');
  if (!contenedor) return;
  
  contenedor.innerHTML = '';

  // Cargar los 4 días de rutina configurados
  for (let i = 1; i <= 4; i++) {
    const nombreRutina = localStorage.getItem(`rutinaDia_${i}`) || `Día ${i}: Rutina General`;
    
    // Recuperar ejercicios específicos guardados para este día con manejo seguro de errores JSON
    let ejerciciosDia = [
      "Calentamiento articular (5 mins)",
      "Ejercicios principales del banco",
      "Estiramiento final"
    ];

    try {
      const ejerciciosGuardados = localStorage.getItem(`ejercicios_Dia_${i}`);
      if (ejerciciosGuardados) {
        ejerciciosDia = JSON.parse(ejerciciosGuardados);
      }
    } catch (e) {
      console.warn(`No se pudieron parsear los ejercicios del Día ${i}`);
    }

    // Verificar si el día ya fue completado por el usuario
    const estaCompletado = localStorage.getItem(`diaCompletado_${i}`) === 'true';

    // Generar la lista de ejercicios de forma segura
    let listaEjerciciosHTML = '';
    if (Array.isArray(ejerciciosDia)) {
      listaEjerciciosHTML = ejerciciosDia.map(ej => `<li class="mb-1">${ej}</li>`).join('');
    } else {
      listaEjerciciosHTML = `<li class="mb-1">${ejerciciosDia}</li>`;
    }

    // Construir la tarjeta dinámicamente
    const cardHTML = `
      <div class="column is-12">
        <div class="box rutina-card p-5 glass-box">
          <div class="level is-mobile mb-3">
            <div class="level-left">
              <h3 class="title is-5 has-text-white mb-0">${nombreRutina}</h3>
            </div>
            <div class="level-right">
              <span class="tag ${estaCompletado ? 'is-success' : 'is-warning'} is-medium">
                ${estaCompletado ? 'Completado ✅' : 'Pendiente ⏳'}
              </span>
            </div>
          </div>

          <p class="is-size-6 has-text-grey-light mb-2">Ejercicios asignados:</p>
          <ul class="mb-4" style="list-style-type: disc; padding-left: 20px;">
            ${listaEjerciciosHTML}
          </ul>

          <div class="has-text-right">
            <button class="button ${estaCompletado ? 'is-danger is-light' : 'is-success'} is-small" onclick="toggleCompletarDia(${i})">
              ${estaCompletado ? 'Marcar como Pendiente' : 'Marcar como Completado 🎯'}
            </button>
          </div>
        </div>
      </div>
    `;
    contenedor.innerHTML += cardHTML;
  }
}

// Función global para alternar el estado de completado de un día y actualizar contadores
window.toggleCompletarDia = function(numDia) {
  const estadoActual = localStorage.getItem(`diaCompletado_${numDia}`) === 'true';
  const nuevoEstado = !estadoActual;

  localStorage.setItem(`diaCompletado_${numDia}`, nuevoEstado);

  let sesionesCompletadas = parseInt(localStorage.getItem('sesionesCompletadas')) || 0;
  if (nuevoEstado) {
    sesionesCompletadas += 1;
    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta(`¡Buen trabajo! Has completado el Día ${numDia}.`, "success");
    }
  } else {
    sesionesCompletadas = Math.max(0, sesionesCompletadas - 1);
    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta(`Has marcado el Día ${numDia} como pendiente.`, "warning");
    }
  }
  localStorage.setItem('sesionesCompletadas', sesionesCompletadas);

  setTimeout(() => {
    location.reload();
  }, 1000);
}