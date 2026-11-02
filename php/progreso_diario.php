<?php
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

$yo = $_SESSION['id_usuario'] ?? 0;
if (!$yo) {
    echo json_encode(["ok" => false, "mensaje" => "Debes iniciar sesión."]);
    exit;
}
$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'listar';

switch ($accion) {

    // READ: mi historial (o solo hoy con ?hoy=1)
    case 'listar':
        if (isset($_GET['hoy'])) {
            $stmt = $conn->prepare("SELECT * FROM progreso_diario WHERE id_usuario = ? AND fecha = CURDATE()");
        } else {
            $stmt = $conn->prepare("SELECT * FROM progreso_diario WHERE id_usuario = ? ORDER BY fecha DESC");
        }
        $stmt->bind_param("i", $yo);
        $stmt->execute();
        echo json_encode(["ok" => true, "progreso" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
        break;

    // CREATE / UPDATE: sumar calorías a hoy (crea la fila si no existe)
    case 'sumar':
        $q = (int)($_POST['quemadas'] ?? 0);
        $c = (int)($_POST['consumidas'] ?? 0);
        $stmt = $conn->prepare("INSERT INTO progreso_diario (id_usuario, fecha, calorias_quemadas, calorias_consumidas)
                                VALUES (?, CURDATE(), ?, ?)
                                ON DUPLICATE KEY UPDATE
                                calorias_quemadas = calorias_quemadas + VALUES(calorias_quemadas),
                                calorias_consumidas = calorias_consumidas + VALUES(calorias_consumidas)");
        $stmt->bind_param("iii", $yo, $q, $c);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Progreso guardado."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // UPDATE: corregir los valores de un día
    case 'actualizar':
        $fecha = $_POST['fecha'] ?? '';
        $q = (int)($_POST['quemadas'] ?? 0);
        $c = (int)($_POST['consumidas'] ?? 0);
        $stmt = $conn->prepare("UPDATE progreso_diario SET calorias_quemadas = ?, calorias_consumidas = ?
                                WHERE id_usuario = ? AND fecha = ?");
        $stmt->bind_param("iiis", $q, $c, $yo, $fecha);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Día actualizado."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // DELETE: borrar un día
    case 'eliminar':
        $fecha = $_POST['fecha'] ?? '';
        $stmt = $conn->prepare("DELETE FROM progreso_diario WHERE id_usuario = ? AND fecha = ?");
        $stmt->bind_param("is", $yo, $fecha);
        echo ($stmt->execute() && $stmt->affected_rows > 0)
            ? json_encode(["ok" => true, "mensaje" => "Día eliminado."])
            : json_encode(["ok" => false, "mensaje" => "No hay registro de esa fecha."]);
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>