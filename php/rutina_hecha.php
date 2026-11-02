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

    // READ: lo que ya marqué como hecho
    case 'listar':
        $stmt = $conn->prepare("SELECT dia, id_ejercicio FROM rutina_hecha WHERE id_usuario = ?");
        $stmt->bind_param("i", $yo);
        $stmt->execute();
        echo json_encode(["ok" => true, "hechos" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
        break;

    // CREATE: marcar ejercicio como hecho
    case 'marcar':
        $dia = (int)($_POST['dia'] ?? 0);
        $ej = $_POST['id_ejercicio'] ?? '';
        $stmt = $conn->prepare("INSERT IGNORE INTO rutina_hecha (id_usuario, dia, id_ejercicio) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $yo, $dia, $ej);
        echo $stmt->execute()
            ? json_encode(["ok" => true])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // DELETE: desmarcar un ejercicio
    case 'desmarcar':
        $dia = (int)($_POST['dia'] ?? 0);
        $ej = $_POST['id_ejercicio'] ?? '';
        $stmt = $conn->prepare("DELETE FROM rutina_hecha WHERE id_usuario = ? AND dia = ? AND id_ejercicio = ?");
        $stmt->bind_param("iis", $yo, $dia, $ej);
        echo $stmt->execute()
            ? json_encode(["ok" => true])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // DELETE: reiniciar toda mi rutina
    case 'reiniciar':
        $stmt = $conn->prepare("DELETE FROM rutina_hecha WHERE id_usuario = ?");
        $stmt->bind_param("i", $yo);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Rutina reiniciada."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>