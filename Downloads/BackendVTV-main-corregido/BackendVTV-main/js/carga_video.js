document.addEventListener('DOMContentLoaded', function() {
  const formEjercicio = document.getElementById('formEjercicio');
  const inputVideo = document.getElementById('videoEjercicio');
  const previewContainer = document.getElementById('previewVideo');
  const btnQuitar = document.getElementById('btnQuitarVideo');
  const errorMsg = document.getElementById('errorVideo');

  let urlTemporal = null;

  if (!inputVideo) return;

  // Previsualización local del video antes de enviarlo
  inputVideo.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (errorMsg) errorMsg.textContent = "";

    if (urlTemporal) URL.revokeObjectURL(urlTemporal);
    urlTemporal = URL.createObjectURL(file);

    if (previewContainer) {
      previewContainer.innerHTML = `
        <video controls autoplay loop muted style="max-height: 200px; border-radius: 8px;">
          <source src="${urlTemporal}" type="${file.type}">
          Tu navegador no soporta video.
        </video>
        <p class="is-size-7 has-text-success mt-2">✓ Archivo listo para subir: ${file.name}</p>
      `;
    }

    if (btnQuitar) btnQuitar.removeAttribute('hidden');
  });

  if (btnQuitar) {
    btnQuitar.addEventListener('click', function() {
      inputVideo.value = "";
      if (urlTemporal) {
        URL.revokeObjectURL(urlTemporal);
        urlTemporal = null;
      }
      if (previewContainer) {
        previewContainer.innerHTML = `
          <i class="fas fa-play-circle fa-2x mb-2" style="color: #4b5563;"></i>
          <p class="is-size-7 has-text-grey">Reproductor / Previsualización del video en bucle</p>
        `;
      }
      btnQuitar.setAttribute('hidden', 'true');
      if (errorMsg) errorMsg.textContent = "";
    });
  }

  // Envío de datos y archivos reales al backend PHP
  if (formEjercicio) {
    formEjercicio.addEventListener('submit', function(e) {
      e.preventDefault(); // Evita recarga brusca para manejar la respuesta del servidor

      const formData = new FormData(formEjercicio);

      // Petición al PHP encargado de procesar los ejercicios
      fetch('../php/Ejercicios.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (!data.ok) {
          if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(data.mensaje || "Error al guardar el ejercicio.", "danger");
          }
          return;
        }

        if (typeof mostrarAlerta === 'function') {
          mostrarAlerta("¡Ejercicio y video guardados exitosamente en el servidor!", "success");
        }

        setTimeout(() => {
          window.location.href = 'adm.html';
        }, 1200);
      })
      .catch(err => {
        console.error('Error al conectar con el servidor:', err);
        if (typeof mostrarAlerta === 'function') {
          mostrarAlerta("No se pudo conectar con el servidor PHP.", "danger");
        }
      });
    });
  }
});