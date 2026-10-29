document.addEventListener('DOMContentLoaded', function() {
  const formEjercicio = document.getElementById('formEjercicio'); // Asegúrate de que este sea el ID de tu <form>

  if (!formEjercicio) return;

  formEjercicio.addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue

    // Capturar los inputs (ajusta los IDs si en tu HTML tienen otros nombres)
    const inputNombre = document.getElementById('nombreEjercicio');
    const inputGrupo = document.getElementById('grupoMuscular');

    if (!inputNombre || !inputGrupo) {
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta("No se encontraron los campos del formulario.", "danger");
      }
      return;
    }

    const nombre = inputNombre.value.trim();
    const grupo = inputGrupo.value.trim();

    if (!nombre || !grupo) {
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta("Por favor, completa todos los campos obligatorios.", "warning");
      }
      return;
    }

    // 1. Recuperar el banco actual de localStorage (o crear un arreglo vacío)
    let bancoEjercicios = JSON.parse(localStorage.getItem('bancoEjercicios')) || [];

    // 2. Agregar el nuevo ejercicio al arreglo
    bancoEjercicios.push({
      nombre: nombre,
      grupo: grupo
    });

    // 3. Guardar de vuelta en el localStorage
    localStorage.setItem('bancoEjercicios', JSON.stringify(bancoEjercicios));

    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta("¡Ejercicio guardado exitosamente en el banco!", "success");
    }

    // 4. Redirigir de regreso al panel de administración o vista principal tras un breve retraso
    setTimeout(() => {
      window.location.href = 'adm.html'; // Cambia 'adm.html' por tu página de destino si es diferente
    }, 1200);
  });
});