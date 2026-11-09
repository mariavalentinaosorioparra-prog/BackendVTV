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