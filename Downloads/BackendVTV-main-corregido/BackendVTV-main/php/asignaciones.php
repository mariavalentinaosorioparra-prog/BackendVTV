<?php
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

$yo = $_SESSION['id_usuario'] ?? 0;
$esAdmin = !empty($_SESSION['es_admin']);
$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'mias';

if (!$yo) {
    echo json_encode(["ok" => false, "mensaje" => "Debes iniciar sesión."]);
    exit;
}
if (in_array($accion, ['listar', 'crear', 'actualizar', 'eliminar']) && !$esAdmin) {
    echo json_encode(["ok" => false, "mensaje" => "Solo el administrador puede hacer esto."]);
    exit;
}

switch ($accion) {

    // SELECT (usuario): lo que me asignaron
    case 'mias':
        $stmt = $conn->prepare("SELECT tipo, dia, calorias, contenido FROM asignaciones WHERE id_usuario = ? ORDER BY dia");
        $stmt->bind_param("i", $yo);
        $stmt->execute();
        echo json_encode(["ok" => true, "asignaciones" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
        break;

    // SELECT (admin): todas, con el correo del usuario
    case 'listar':
        $res = $conn->query("SELECT a.id, a.tipo, a.dia, a.calorias, a.contenido, a.fecha, u.correo
                             FROM asignaciones a JOIN usuarios u ON u.id = a.id_usuario
                             ORDER BY a.id DESC");
        echo json_encode(["ok" => true, "asignaciones" => $res->fetch_all(MYSQLI_ASSOC)]);
        break;

    // INSERT (admin): crea o reemplaza la asignación de ese usuario/tipo/día
    case 'crear':
        $correo = trim($_POST['correo'] ?? '');
        $tipo = $_POST['tipo'] ?? '';
        $dia = $_POST['dia'] ?? '';
        $cal = (int)($_POST['calorias'] ?? 0);
        $contenido = $_POST['contenido'] ?? '';

        if (!in_array($tipo, ['rutina', 'plan']) || json_decode($contenido) === null) {
            echo json_encode(["ok" => false, "mensaje" => "Datos no válidos."]);
            break;
        }
        $s = $conn->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $s->bind_param("s", $correo);
        $s->execute();
        $u = $s->get_result()->fetch_assoc();
        if (!$u) {
            echo json_encode(["ok" => false, "mensaje" => "No existe un usuario con ese correo."]);
            break;
        }
        $stmt = $conn->prepare("INSERT INTO asignaciones (id_usuario, tipo, dia, calorias, contenido)
                                VALUES (?, ?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE calorias = VALUES(calorias), contenido = VALUES(contenido)");
        $stmt->bind_param("issis", $u['id'], $tipo, $dia, $cal, $contenido);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Asignación guardada para $correo."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // UPDATE (admin)
    case 'actualizar':
        $id = (int)($_POST['id'] ?? 0);
        $dia = $_POST['dia'] ?? '';
        $cal = (int)($_POST['calorias'] ?? 0);
        $contenido = $_POST['contenido'] ?? '';
        if ($id <= 0 || json_decode($contenido) === null) {
            echo json_encode(["ok" => false, "mensaje" => "Datos no válidos."]);
            break;
        }
        $stmt = $conn->prepare("UPDATE asignaciones SET dia = ?, calorias = ?, contenido = ? WHERE id = ?");
        $stmt->bind_param("sisi", $dia, $cal, $contenido, $id);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Asignación actualizada."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // DELETE (admin)
    case 'eliminar':
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $conn->prepare("DELETE FROM asignaciones WHERE id = ?");
        $stmt->bind_param("i", $id);
        echo ($stmt->execute() && $stmt->affected_rows > 0)
            ? json_encode(["ok" => true, "mensaje" => "Asignación eliminada."])
            : json_encode(["ok" => false, "mensaje" => "No se encontró esa asignación."]);
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>