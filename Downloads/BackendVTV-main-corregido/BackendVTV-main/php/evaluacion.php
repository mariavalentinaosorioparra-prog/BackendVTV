<?php  
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

$yo = $_SESSION['id_usuario'] ?? null;
$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'crear';

if ($accion !== 'crear' && !$yo) {
    echo json_encode(["ok" => false, "mensaje" => "Debes iniciar sesión."]);
    exit;
}

switch ($accion) {

    // INSERT (lo que ya usaba evaluacion.js)
    case 'crear':
        $fechaNacimiento = $_POST["fechaNacimiento"] ?? '';
        $peso = $_POST['peso'] ?? 0;  /** inputs de evaluacion.html */
        $altura = $_POST['altura'] ?? 0;
        $objetivo = $_POST['objetivo'] ?? '';
        $sexo = $_POST['sexo'] ?? '';
        $nivel = $_POST['nivel'] ?? '';

        $stmt = $conn->prepare("INSERT INTO evaluacion (id_usuario, fechaNacimiento, peso, altura, objetivo, sexo, nivel)
                                VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isddsss", $yo, $fechaNacimiento, $peso, $altura, $objetivo, $sexo, $nivel);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Registro guardado correctamente.", "id" => $conn->insert_id])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // SELECT: mis evaluaciones
    case 'listar':
        $stmt = $conn->prepare("SELECT * FROM evaluacion WHERE id_usuario = ? ORDER BY id DESC");
        $stmt->bind_param("i", $yo);
        $stmt->execute();
        echo json_encode(["ok" => true, "evaluaciones" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
        break;

    // UPDATE
    case 'actualizar':
        $id = (int)($_POST['id'] ?? 0);
        $fechaNacimiento = $_POST["fechaNacimiento"] ?? '';
        $peso = $_POST['peso'] ?? 0;
        $altura = $_POST['altura'] ?? 0;
        $objetivo = $_POST['objetivo'] ?? '';
        $sexo = $_POST['sexo'] ?? '';
        $nivel = $_POST['nivel'] ?? '';

        $stmt = $conn->prepare("UPDATE evaluacion SET fechaNacimiento=?, peso=?, altura=?, objetivo=?, sexo=?, nivel=?
                                WHERE id=? AND id_usuario=?");
        $stmt->bind_param("sddsssii", $fechaNacimiento, $peso, $altura, $objetivo, $sexo, $nivel, $id, $yo);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Evaluación actualizada."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // DELETE
    case 'eliminar':
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $conn->prepare("DELETE FROM evaluacion WHERE id = ? AND id_usuario = ?");
        $stmt->bind_param("ii", $id, $yo);
        echo ($stmt->execute() && $stmt->affected_rows > 0)
            ? json_encode(["ok" => true, "mensaje" => "Evaluación eliminada."])
            : json_encode(["ok" => false, "mensaje" => "No se encontró esa evaluación."]);
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>