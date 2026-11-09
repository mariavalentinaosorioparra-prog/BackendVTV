(function () {
  const input = document.getElementById('videoEjercicio');
  const zona = document.getElementById('zonaVideo');
  const prev = document.getElementById('previewVideo');
  const err = document.getElementById('errorVideo');
  const btn = document.getElementById('btnQuitarVideo');
  const form = document.getElementById('formEjercicio');
  if (!input || !zona) return;

  const MAX = 25 * 1024 * 1024;
  const VID = ['mp4', 'webm'];
  const EXT = VID.concat(['gif']);
  const placeholder = prev.innerHTML;
  let url = null;

  function limpiar() {
    if (url) URL.revokeObjectURL(url);
    url = null; input.value = '';
    prev.innerHTML = placeholder;
    btn.hidden = true;
  }

  function mostrar(file) {
    err.textContent = '';
    const ext = file.name.split('.').pop().toLowerCase();
    if (!EXT.includes(ext)) { limpiar(); err.textContent = 'Formato no permitido. Usa MP4, WebM o GIF.'; return; }
    if (file.size > MAX) { limpiar(); err.textContent = 'El archivo supera los 25 MB.'; return; }
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(file);
    prev.innerHTML = '';
    let el;
    if (VID.includes(ext)) {
      el = document.createElement('video');
      el.src = url; el.autoplay = true; el.loop = true; el.muted = true; el.controls = true;
    } else {
      el = document.createElement('img');
      el.src = url;
    }
    prev.appendChild(el);
    btn.hidden = false;
  }

  input.addEventListener('change', () => input.files[0] ? mostrar(input.files[0]) : limpiar());
  btn.addEventListener('click', limpiar);

  ['dragenter', 'dragover'].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.classList.remove('is-dragover'); }));
  zona.addEventListener('drop', e => {
    const f = e.dataTransfer.files[0];
    if (!f) return;
    input.files = e.dataTransfer.files;
    mostrar(f);
  });

  form.addEventListener('reset', () => setTimeout(limpiar, 0));
})();