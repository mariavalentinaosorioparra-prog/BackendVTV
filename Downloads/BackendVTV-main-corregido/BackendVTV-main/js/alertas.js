function mostrarAlerta(mensaje, tipo = 'danger') {
  // Elimina alerta previa si existe
  const alertaPrevia = document.getElementById('customToast');
  if (alertaPrevia) {
    alertaPrevia.remove();
  }

  const iconos = {
    danger: 'fas fa-exclamation-circle',
    success: 'fas fa-check-circle',
    warning: 'fas fa-triangle-exclamation'
  };

  const colorIcono = tipo === 'danger' ? '#f87171' : tipo === 'success' ? '#4ade80' : '#facc15';

  // Crear contenedor Toast
  const toast = document.createElement('div');
  toast.id = 'customToast';
  toast.className = `custom-toast toast-${tipo}`;
  toast.innerHTML = `
    <i class="${iconos[tipo] || iconos.danger} fa-lg" style="color: ${colorIcono};"></i>
    <div style="flex: 1;">${mensaje}</div>
  `;

  document.body.appendChild(toast);

  // Remueve automáticamente
  setTimeout(function() {
    toast.style.animation = 'fadeOut 0.4s ease-out forwards';
    setTimeout(function() {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400);
  }, 3500);
}

function mostrarConfirmacion(mensaje, callbackAceptar) {
  // Eliminar modal previo si existe
  const modalPrevio = document.getElementById('customConfirmModal');
  if (modalPrevio) modalPrevio.remove();

  // Crear elementos del modal
  const modal = document.createElement('div');
  modal.id = 'customConfirmModal';
  modal.className = 'modal is-active';
  modal.innerHTML = `
    <div class="modal-background" style="background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);"></div>
    <div class="modal-card" style="max-width: 400px; margin: auto 15px;">
      <header class="modal-card-head" style="background: rgba(30, 30, 30, 0.9); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <p class="modal-card-title has-text-white is-size-5 mb-0">
          <i class="fas fa-sign-out-alt mr-2" style="color: #f87171;"></i>Cerrar Sesión
        </p>
      </header>
      <section class="modal-card-body has-text-centered" style="background: rgba(20, 20, 20, 0.9); color: #fff;">
        <p class="is-size-6 mb-0">${mensaje}</p>
      </section>
      <footer class="modal-card-foot is-flex is-justify-content-center" style="background: rgba(30, 30, 30, 0.9); border-top: 1px solid rgba(255, 255, 255, 0.1); gap: 12px;">
        <button id="btnConfirmCancelar" class="button is-light is-outlined is-rounded">Cancelar</button>
        <button id="btnConfirmAceptar" class="button is-danger is-rounded">Sí, Cerrar Sesión</button>
      </footer>
    </div>
  `;

  document.body.appendChild(modal);

  // Listeners de los botones
  document.getElementById('btnConfirmCancelar').addEventListener('click', function() {
    modal.remove();
  });

  document.getElementById('btnConfirmAceptar').addEventListener('click', function() {
    modal.remove();
    if (typeof callbackAceptar === 'function') {
      callbackAceptar();
    }
  });
}