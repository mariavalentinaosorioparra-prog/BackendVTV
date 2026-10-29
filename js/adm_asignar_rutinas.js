document.addEventListener('DOMContentLoaded', function() {
      // 1. Cargar ejercicios guardados desde el Banco de Ejercicios (localStorage)
      const contenedorEjercicios = document.getElementById('listaEjerciciosBanco');
      const ejerciciosBanco = JSON.parse(localStorage.getItem('bancoEjercicios')) || [
        { nombre: 'Flexiones de Pecho', grupo: 'Pecho' },
        { nombre: 'Sentadillas libres', grupo: 'Piernas' },
        { nombre: 'Plancha abdominal', grupo: 'Core' }
      ]; // Valores por defecto si el banco está vacío

      contenedorEjercicios.innerHTML = '';
      ejerciciosBanco.forEach((ej, index) => {
        const checkboxHTML = `
          <label class="checkbox block has-text-white mb-2">
            <input type="checkbox" name="ejercicioSeleccionado" value="${ej.nombre}" class="mr-2">
            <strong>${ej.nombre}</strong> <span class="tag is-dark is-small ml-2">${ej.grupo || 'General'}</span>
          </label>
        `;
        contenedorEjercicios.innerHTML += checkboxHTML;
      });

      // 2. Guardar asignación
      document.getElementById('formAsignarRutina').addEventListener('submit', function(e) {
        e.preventDefault();
        const correo = document.getElementById('correoUsuario').value.trim();
        const dia = document.getElementById('selectDia').value;
        
        const seleccionados = [];
        document.querySelectorAll('input[name="ejercicioSeleccionado"]:checked').forEach(cb => {
          seleccionados.push(cb.value);
        });

        if (seleccionados.length === 0) {
          mostrarAlerta("Selecciona al menos un ejercicio para la rutina.", "warning");
          return;
        }

        // Guardamos en localStorage la rutina asignada para ese usuario/día
        localStorage.setItem(`rutina_${correo}_${dia}`, JSON.stringify(seleccionados));
        localStorage.setItem(`rutinaDia_${dia.replace(' ', '_')}`, `${dia}: Personalizada`);

        mostrarAlerta(`¡Rutina asignada con éxito para ${correo}!`, "success");
        setTimeout(() => { window.location.href = 'adm.html'; }, 1500);
      });
    });