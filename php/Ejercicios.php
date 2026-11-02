<?php
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'listar';

// Solo el administrador puede crear, editar o eliminar
if ($accion !== 'listar' && empty($_SESSION['es_admin'])) {
    echo json_encode(["ok" => false, "mensaje" => "Solo el administrador puede hacer esto."]);
    exit;
}

switch ($accion) {

    // ---------- READ: listar todos o uno ----------
    case 'listar':
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT * FROM ejercicios WHERE id = ?");
            $stmt->bind_param("i", $_GET['id']);
            $stmt->execute();
            $fila = $stmt->get_result()->fetch_assoc();
            echo json_encode(["ok" => (bool)$fila, "ejercicio" => $fila]);
        } else {
            $res = $conn->query("SELECT * FROM ejercicios ORDER BY id DESC");
            echo json_encode(["ok" => true, "ejercicios" => $res->fetch_all(MYSQLI_ASSOC)]);
        }
        break;

    //Create 
    case 'crear':
        $nombre    = trim($_POST['nombre'] ?? '');
        $grupo     = $_POST['grupo'] ?? '';
        $series    = (int)($_POST['series'] ?? 3);
        $reps      = $_POST['reps'] ?? '10-12';
        $impacto   = $_POST['impacto'] ?? 'bma';
        $enfoques  = $_POST['enfoques'] ?? 'phf';
        $compuesto = (int)($_POST['compuesto'] ?? 0);
        $tecnica   = $_POST['tecnica'] ?? '';

        if ($nombre === '' || $grupo === '') {
            echo json_encode(["ok" => false, "mensaje" => "Nombre y grupo son obligatorios."]);
            break;
        }
        $stmt = $conn->prepare("INSERT INTO ejercicios (nombre, grupo, series, reps, impacto, enfoques, compuesto, tecnica)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssisssis", $nombre, $grupo, $series, $reps, $impacto, $enfoques, $compuesto, $tecnica);
        if ($stmt->execute()) {
            echo json_encode(["ok" => true, "mensaje" => "Ejercicio creado.", "id" => $conn->insert_id]);
        } else {
            echo json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        }
        break;

    //Update
    case 'actualizar':
        $id        = (int)($_POST['id'] ?? 0);
        $nombre    = trim($_POST['nombre'] ?? '');
        $grupo     = $_POST['grupo'] ?? '';
        $series    = (int)($_POST['series'] ?? 3);
        $reps      = $_POST['reps'] ?? '10-12';
        $impacto   = $_POST['impacto'] ?? 'bma';
        $enfoques  = $_POST['enfoques'] ?? 'phf';
        $compuesto = (int)($_POST['compuesto'] ?? 0);
        $tecnica   = $_POST['tecnica'] ?? '';

        if ($id <= 0 || $nombre === '' || $grupo === '') {
            echo json_encode(["ok" => false, "mensaje" => "Faltan datos."]);
            break;
        }
        $stmt = $conn->prepare("UPDATE ejercicios
                                SET nombre=?, grupo=?, series=?, reps=?, impacto=?, enfoques=?, compuesto=?, tecnica=?
                                WHERE id=?");
        $stmt->bind_param("ssisssisi", $nombre, $grupo, $series, $reps, $impacto, $enfoques, $compuesto, $tecnica, $id);
        if ($stmt->execute()) {
            echo json_encode(["ok" => true, "mensaje" => "Ejercicio actualizado."]);
        } else {
            echo json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        }
        break;

    //Delete
    case 'eliminar':
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $conn->prepare("DELETE FROM ejercicios WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            echo json_encode(["ok" => true, "mensaje" => "Ejercicio eliminado."]);
        } else {
            echo json_encode(["ok" => false, "mensaje" => "No se encontró ese ejercicio."]);
        }
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>