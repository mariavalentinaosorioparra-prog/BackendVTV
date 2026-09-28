    // Se ejecuta al cargar paginaP.html
    document.addEventListener('DOMContentLoaded', function() {
      if (sessionStorage.getItem('infoGuardada') === 'true') {
        const notif = document.getElementById('notificacionExito');
        if (notif) {
          notif.style.display = 'block';
          
          // Oculta automáticamente después de 4 segundos
          setTimeout(function() {
            notif.style.display = 'none';
          }, 4000);
        }
        // Limpia la bandera para que no reaparezca al recargar la página manualmente
        sessionStorage.removeItem('infoGuardada');

      }
    });

