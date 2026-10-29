document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Validar seguridad: Verificar sesión activa
  const sesionIniciada = sessionStorage.getItem('sesionIniciada');
  const correoActivo = localStorage.getItem('usuarioActivo');

  if (sesionIniciada !== 'true' || !correoActivo) {
    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta("Acceso denegado. Por favor, inicia sesión.", "danger");
    }
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }

  cargarPlanNutricional(correoActivo);
});

function cargarPlanNutricional(correo) {
  const kcalElem = document.getElementById('kcalObjetivo');
  const contenedorAlimentos = document.getElementById('contenedorAlimentos');
  
  if (!contenedorAlimentos) return;

  // 1. Buscar plan personalizado asignado por el admin o sistema a este correo
  let planData = null;
  try {
    const planGuardado = localStorage.getItem(`planNutricional_${correo}`);
    if (planGuardado) {
      planData = JSON.parse(planGuardado);
    }
  } catch (e) {
    console.warn("No se pudo leer el plan nutricional del usuario.");
  }

  // 2. Si no hay plan específico, usar valores por defecto del banco general
  let caloriasObjetivo = planData?.calorias || "2200";
  let alimentosLista = planData?.alimentos || [];

  if (alimentosLista.length === 0) {
    // Si el usuario no tiene alimentos asignados, cargamos algunos del banco general
    const bancoGeneral = JSON.parse(localStorage.getItem('bancoAlimentos')) || [
      { nombre: 'Pechuga de pollo a la plancha con verduras', calorias: '350 kcal' },
      { nombre: 'Arroz integral y aguacate', calorias: '400 kcal' },
      { nombre: 'Batido de proteína con avena y banano', calorias: '300 kcal' }
    ];
    alimentosLista = bancoGeneral.map(item => item.nombre);
  }

  // Mostrar calorías objetivo
  if (kcalElem) {
    kcalElem.innerText = `${caloriasObjetivo} kcal`;
  }

  // Renderizar la lista de alimentos
  contenedorAlimentos.innerHTML = '';
  if (alimentosLista.length > 0) {
    alimentosLista.forEach((alimento, index) => {
      contenedorAlimentos.innerHTML += `
        <div class="nutricion-item">
          <div>
            <i class="fas fa-check-circle mr-2 has-text-success"></i>
            <span class="has-text-white font-weight-bold">${alimento}</span>
          </div>
          <span class="tag is-dark is-medium">Recomendado</span>
        </div>
      `;
    });
  } else {
    contenedorAlimentos.innerHTML = `<p class="has-text-grey-light">No hay alimentos asignados en este momento.</p>`;
  }
}