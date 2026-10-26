document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Inicializar o recuperar valores de LocalStorage
  let caloriasQuemadas = parseFloat(localStorage.getItem('caloriasQuemadas')) || 0;
  let caloriasConsumidas = parseFloat(localStorage.getItem('caloriasConsumidas')) || 0;
  
  // Meta calórica estándar o basada en el objetivo (ejemplo: 2000 kcal como base)
  const metaCaloriasDiarias = 2000; 

  // 2. Renderizar los datos en la interfaz de progreso
  const elemQuemadas = document.getElementById('progresoQuemadas');
  const elemConsumidas = document.getElementById('progresoConsumidas');
  const elemBalance = document.getElementById('progresoBalance');
  const barraProgreso = document.getElementById('barraProgresoGlobal');

  if (elemQuemadas) elemQuemadas.innerText = `${caloriasQuemadas} kcal`;
  if (elemConsumidas) elemConsumidas.innerText = `${caloriasConsumidas} kcal`;

  // Balance calórico (Consumidas - Quemadas)
  const balance = caloriasConsumidas - caloriasQuemadas;
  if (elemBalance) elemBalance.innerText = `${balance} kcal`;

  // Calcular porcentaje de progreso global (basado en calorías quemadas vs meta de ejercicio o actividad)
  let porcentajeProgreso = Math.min(Math.round((caloriasQuemadas / 500) * 100), 100); // Asumiendo 500 kcal de meta diaria de ejercicio
  if (barraProgreso) {
    barraProgreso.style.width = `${porcentajeProgreso}%`;
    barraProgreso.innerText = `${porcentajeProgreso}%`;
  }

});

// --- FUNCIONES PARA ACUMULAR PROGRESO DESDE OTRAS VISTAS ---

// Función para registrar un ejercicio completado (Suma calorías quemadas)
function registrarEjercicioCompletado(caloriasEjercicio) {
  let actualQuemadas = parseFloat(localStorage.getItem('caloriasQuemadas')) || 0;
  actualQuemadas += parseFloat(caloriasEjercicio);
  localStorage.setItem('caloriasQuemadas', actualQuemadas);
  
  // Opcional: actualizar plan asignado o notificar
  localStorage.setItem('planAsignado', 'true');
}

// Función para registrar un alimento consumido (Suma calorías ingeridas)
function registrarAlimentoConsumido(caloriasAlimento) {
  let actualConsumidas = parseFloat(localStorage.getItem('caloriasConsumidas')) || 0;
  actualConsumidas += parseFloat(caloriasAlimento);
  localStorage.setItem('caloriasConsumidas', actualConsumidas);
}