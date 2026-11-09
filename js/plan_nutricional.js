document.getElementById('formAlimento').addEventListener('submit', function(e) {
  e.preventDefault();

  // Supongamos que tus inputs tienen estos IDs
  const inputNombre = document.getElementById('nombreAlimento');
  const inputCalorias = document.getElementById('caloriasAlimento');

  if (!inputNombre || !inputCalorias) {
    mostrarAlerta("Error en la estructura del formulario.", "danger");
    return;
  }

  const nombre = inputNombre.value.trim();
  const calorias = inputCalorias.value.trim();

  if (!nombre || !calorias) {
    mostrarAlerta("Por favor, completa todos los campos.", "warning");
    return;
  }

  // 1. Recuperar el banco de alimentos actual de localStorage
  let bancoAlimentos = JSON.parse(localStorage.getItem('bancoAlimentos')) || [];

  // 2. Agregar el nuevo alimento/plato
  bancoAlimentos.push({
    nombre: nombre,
    calorias: `${calorias} kcal`
  });

  // 3. Guardar en localStorage
  localStorage.setItem('bancoAlimentos', JSON.stringify(bancoAlimentos));

  mostrarAlerta("¡Alimento registrado exitosamente en el banco!", "success");

  setTimeout(() => {
    window.location.href = 'adm.html'; // Regresar al panel de administración
  }, 1500);
});