(function () {
  const input = document.getElementById('modelo3d');
  const zona = document.getElementById('zonaCarga');
  const prev = document.getElementById('previewCarga');
  const err = document.getElementById('errorCarga');
  const btn = document.getElementById('btnQuitar');
  const form = document.getElementById('formPlato');
  if (!input || !zona || !prev || !err || !btn || !form) return;

  const MAX = 25 * 1024 * 1024;
  const EXT = ['glb', 'gltf', 'obj', 'png', 'jpg', 'jpeg', 'webp', 'gif'];
  const IMG = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
  const placeholder = prev.innerHTML;
  let url = null;

  function limpiar() {
    if (url) URL.revokeObjectURL(url);
    url = null;
    input.value = '';
    prev.innerHTML = placeholder;
    err.textContent = '';
    btn.hidden = true;
  }

  function mostrar(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!EXT.includes(ext)) {
      limpiar();
      err.textContent = 'Formato no permitido. Usa .glb, .gltf, .obj o una imagen.';
      return;
    }
    if (file.size > MAX) {
      limpiar();
      err.textContent = 'El archivo supera los 25 MB.';
      return;
    }

    err.textContent = '';
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(file);
    prev.innerHTML = '';

    if (IMG.includes(ext)) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = file.name;
      prev.appendChild(img);
    } else if (ext === 'glb') {
      const mv = document.createElement('model-viewer');
      mv.setAttribute('src', url);
      mv.setAttribute('alt', file.name);
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('auto-rotate', '');
      prev.appendChild(mv);
    } else {
      // .obj y .gltf: sin vista previa, pero se suben igual
      const t = document.createElement('span');
      t.className = 'is-size-7 has-text-grey';
      t.textContent = 'Archivo listo: ' + file.name + ' (sin vista previa para .' + ext + ')';
      prev.appendChild(t);
    }
    btn.hidden = false;
  }

  input.addEventListener('change', () => {
    input.files[0] ? mostrar(input.files[0]) : limpiar();
  });
  btn.addEventListener('click', limpiar);

  // Arrastrar y soltar
  ['dragenter', 'dragover'].forEach(ev => zona.addEventListener(ev, e => {
    e.preventDefault();
    zona.classList.add('is-dragover');
  }));
  zona.addEventListener('dragleave', e => {
    // Solo quitar el resaltado si el cursor sale de la zona (no al pasar sobre hijos)
    if (!zona.contains(e.relatedTarget)) zona.classList.remove('is-dragover');
  });
  zona.addEventListener('drop', e => {
    e.preventDefault();
    zona.classList.remove('is-dragover');
    const f = e.dataTransfer.files[0];
    if (!f) return;
    input.files = e.dataTransfer.files;
    mostrar(f);
  });

  // form.reset() (después de guardar) también limpia la vista previa
  form.addEventListener('reset', () => setTimeout(limpiar, 0));
})();