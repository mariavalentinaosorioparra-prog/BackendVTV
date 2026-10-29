 document.addEventListener('DOMContentLoaded', function() {
      // 1. Cargar alimentos desde el Banco de Alimentos (localStorage)
      const contenedorAlimentos = document.getElementById('listaAlimentosBanco');
      const alimentosBanco = JSON.parse(localStorage.getItem('bancoAlimentos')) || [
        { nombre: 'Pechuga de pollo a la plancha', calorias: '250 kcal' },
        { nombre: 'Arroz integral con aguacate', calorias: '300 kcal' },
        { nombre: 'Avena con banano y proteína', calorias: '350 kcal' }
      ];

      contenedorAlimentos.innerHTML = '';
      alimentosBanco.forEach((alim) => {
        contenedorAlimentos.innerHTML += `
          <label class="checkbox block has-text-white mb-2">
            <input type="checkbox" name="alimentoSeleccionado" value="${alim.nombre}" class="mr-2">
            <strong>${alim.nombre}</strong> <span class="tag is-info is-small ml-2">${alim.calorias || 'Nutritivo'}</span>
          </label>
        `;
      });

      // 2. Guardar plan nutricional asignado
      document.getElementById('formAsignarPlan').addEventListener('submit', function(e) {
        e.preventDefault();
        const correo = document.getElementById('correoPlanUsuario').value.trim();
        const kcal = document.getElementById('caloriasObjetivo').value;
        
        const alimentosElegidos = [];
        document.querySelectorAll('input[name="alimentoSeleccionado"]:checked').forEach(cb => {
          alimentosElegidos.push(cb.value);
        });

        const planNutricionalData = {
          calorias: kcal,
          alimentos: alimentosElegidos
        };

        // Guardamos en localStorage asociado al correo
        localStorage.setItem(`planNutricional_${correo}`, JSON.stringify(planNutricionalData));
        localStorage.setItem(`planAsignado_${correo}`, 'true');

        mostrarAlerta(`¡Plan nutricional asignado correctamente a ${correo}!`, "success");
        setTimeout(() => { window.location.href = 'adm.html'; }, 1500);
      });
    });