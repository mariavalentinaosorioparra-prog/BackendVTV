document.addEventListener('DOMContentLoaded', function() {
  const formPlato = document.getElementById('formPlato');
  const inputModelo = document.getElementById('modelo3d');
  const previewContainer = document.getElementById('previewCarga');
  const btnQuitar = document.getElementById('btnQuitar');
  const errorMsg = document.getElementById('errorCarga');

  let objectUrlTemporal = null;

  if (!inputModelo) return;

  // Previsualización local del modelo 3D o imagen
  inputModelo.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (errorMsg) errorMsg.textContent = "";
    if (!file) return;

    if (objectUrlTemporal) URL.revokeObjectURL(objectUrlTemporal);
    objectUrlTemporal = URL.createObjectURL(file);

    if (previewContainer) {
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        previewContainer.innerHTML = `
          <model-viewer src="${objectUrlTemporal}" alt="Modelo 3D" auto-rotate camera-controls style="width: 100%; height: 260px; border-radius: 8px;"></model-viewer>
          <p class="is-size-7 has-text-success mt-2">✓ Modelo 3D listo: ${file.name}</p>
        `;
      } else if (file.type.startsWith('image/')) {
        previewContainer.innerHTML = `
          <img src="${objectUrlTemporal}" alt="Imagen" style="max-height: 200px; border-radius: 8px;">
          <p class="is-size-7 has-text-success mt-2">✓ Imagen lista: ${file.name}</p>
        `;
      } else {
        previewContainer.innerHTML = `<p class="is-size-7 has-text-success mt-2">✓ Archivo: ${file.name}</p>`;
      }
    }

    if (btnQuitar) btnQuitar.removeAttribute('hidden');
  });

  if (btnQuitar) {
    btnQuitar.addEventListener('click', function() {
      inputModelo.value = "";
      if (objectUrlTemporal) {
        URL.revokeObjectURL(objectUrlTemporal);
        objectUrlTemporal = null;
      }
      if (previewContainer) {
        previewContainer.innerHTML = `
          <i class="fas fa-box-open fa-2x mb-2" style="color: #4b5563;"></i>
          <span class="is-size-7 has-text-grey">Vista previa del objeto 3D interactivo</span>
        `;
      }
      btnQuitar.setAttribute('hidden', 'true');
      if (errorMsg) errorMsg.textContent = "";
    });
  }

  // Envío de datos y archivo 3D al backend PHP de alimentos / plan nutricional
  if (formPlato) {
    formPlato.addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = new FormData(formPlato);

      // Petición al PHP encargado de procesar los alimentos y platos
      fetch('../php/plan_nutricional.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (!data.ok) {
          if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(data.mensaje || "Error al guardar el plato.", "danger");
          }
          return;
        }

        if (typeof mostrarAlerta === 'function') {
          mostrarAlerta("¡Plato y modelo 3D guardados exitosamente en el servidor!", "success");
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