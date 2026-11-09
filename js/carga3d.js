(function () {
  const input = document.getElementById('modelo3d');
  const zona = document.getElementById('zonaCarga');
  const prev = document.getElementById('previewCarga');
  const err = document.getElementById('errorCarga');
  const btn = document.getElementById('btnQuitar');
  const form = document.getElementById('formPlato');
  if (!input || !zona) return;

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
    btn.hidden = true;
  }

  function mostrar(file) {
    err.textContent = '';
    const ext = file.name.split('.').pop().toLowerCase();
    if (!EXT.includes(ext)) { limpiar(); err.textContent = 'Formato no permitido. Usa .glb, .gltf, .obj o una imagen.'; return; }
    if (file.size > MAX) { limpiar(); err.textContent = 'El archivo supera los 25 MB.'; return; }

    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(file);
    prev.innerHTML = '';

    if (IMG.includes(ext)) {
      const img = document.createElement('img');
      img.src = url;
      prev.appendChild(img);
    } else if (ext === 'glb') {
      const mv = document.createElement('model-viewer');
      mv.setAttribute('src', url);
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('auto-rotate', '');
      prev.appendChild(mv);
    } else {
      // .obj y .gltf: no se pueden previsualizar, pero sí se suben
      const t = document.createElement('span');
      t.className = 'is-size-7 has-text-grey';
      t.textContent = 'Archivo listo: ' + file.name + ' (sin vista previa para .' + ext + ')';
      prev.appendChild(t);
    }
    btn.hidden = false;
  }

  input.addEventListener('change', () => input.files[0] ? mostrar(input.files[0]) : limpiar());
  btn.addEventListener('click', limpiar);

  ['dragenter', 'dragover'].forEach(ev => zona.addEventListener(ev, e => {
    e.preventDefault(); zona.classList.add('is-dragover');
  }));
  ['dragleave', 'drop'].forEach(ev => zona.addEventListener(ev, e => {
    e.preventDefault(); zona.classList.remove('is-dragover');
  }));
  zona.addEventListener('drop', e => {
    const f = e.dataTransfer.files[0];
    if (!f) return;
    input.files = e.dataTransfer.files;
    mostrar(f);
  });

  // form.reset() (después de guardar) también limpia la vista previa
  form.addEventListener('reset', () => setTimeout(limpiar, 0));
})();