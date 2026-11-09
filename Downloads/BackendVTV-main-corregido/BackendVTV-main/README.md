# VTV Fitness App

Aplicación web (HTML, CSS y JavaScript con Bulma). Los datos viven en el navegador (`localStorage`).

## Cómo funciona la asignación
1. El usuario se registra y completa la valoración (fecha de nacimiento, peso, altura, sexo, nivel y objetivo).
2. `js/asignacion.js` calcula IMC, edad y metabolismo, y arma la rutina y el plan nutricional con los bancos de `js/datos.js`.
3. `html/Rutinas.html` y `html/planNasignado.html` muestran lo asignado.
4. En `html/adm.html` el administrador agrega ejercicios y platos propios que se suman a los bancos base.

## Reglas principales
- **Impacto de ejercicios:** IMC ≥ 30 solo bajo impacto; IMC 25–29.9 hasta moderado (principiantes solo bajo); alto impacto únicamente con nivel avanzado, IMC < 25 y menos de 55 años.
- **Rutina:** principiante 3 días (cuerpo completo), intermedio 4 (torso/pierna), avanzado 5 (empuje/tirón/pierna).
- **Calorías:** Mifflin-St Jeor × factor de actividad por nivel; −20 % (−25 % con obesidad) para perder, +10 % masa muscular, +15 % ganar peso. Con bajo peso no se reduce y con obesidad no se aumenta.
- **Menú:** 7 días, 4 comidas, porciones ajustadas para llegar a la meta diaria.

Para probar, abre `html/registro.html` en el navegador.
