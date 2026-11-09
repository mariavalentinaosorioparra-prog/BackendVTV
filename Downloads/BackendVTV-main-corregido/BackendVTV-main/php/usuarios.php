<?php
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'perfil';
$yo = $_SESSION['id_usuario'] ?? 0;
$esAdmin = !empty($_SESSION['es_admin']);

if (!$yo) {
    echo json_encode(["ok" => false, "mensaje" => "Debes iniciar sesión."]);
    exit;
}

// Acciones solo para admin
if (in_array($accion, ['listar', 'actualizar', 'eliminar']) && !$esAdmin) {
    echo json_encode(["ok" => false, "mensaje" => "Solo el administrador puede hacer esto."]);
    exit;
}

switch ($accion) {

    // READ: mi propio perfil
    case 'perfil':
        $stmt = $conn->prepare("SELECT id, nombre, correo, es_admin FROM usuarios WHERE id = ?");
        $stmt->bind_param("i", $yo);
        $stmt->execute();
        echo json_encode(["ok" => true, "usuario" => $stmt->get_result()->fetch_assoc()]);
        break;

    // UPDATE: editar mi propio perfil
    case 'editar_perfil':
        $nombre = trim($_POST['nombre'] ?? '');
        $correo = trim($_POST['correo'] ?? '');
        if ($nombre === '' || $correo === '') {
            echo json_encode(["ok" => false, "mensaje" => "Faltan datos."]);
            break;
        }
        $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?");
        $stmt->bind_param("ssi", $nombre, $correo, $yo);
        if ($stmt->execute()) {
            echo json_encode(["ok" => true, "mensaje" => "Perfil actualizado."]);
        } else if ($conn->errno == 1062) {
            echo json_encode(["ok" => false, "mensaje" => "Ese correo ya está en uso."]);
        } else {
            echo json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        }
        break;

    // READ (admin): todos los usuarios
    case 'listar':
        $res = $conn->query("SELECT id, nombre, correo, es_admin FROM usuarios ORDER BY id DESC");
        echo json_encode(["ok" => true, "usuarios" => $res->fetch_all(MYSQLI_ASSOC)]);
        break;

    // UPDATE (admin)
    case 'actualizar':
        $id = (int)($_POST['id'] ?? 0);
        $nombre = trim($_POST['nombre'] ?? '');
        $correo = trim($_POST['correo'] ?? '');
        $admin = (int)($_POST['es_admin'] ?? 0);
        $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, correo = ?, es_admin = ? WHERE id = ?");
        $stmt->bind_param("ssii", $nombre, $correo, $admin, $id);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Usuario actualizado."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // DELETE (admin)
    case 'eliminar':
        $id = (int)($_POST['id'] ?? 0);
        if ($id === $yo) {
            echo json_encode(["ok" => false, "mensaje" => "No puedes eliminar tu propia cuenta."]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
        $stmt->bind_param("i", $id);
        echo ($stmt->execute() && $stmt->affected_rows > 0)
            ? json_encode(["ok" => true, "mensaje" => "Usuario eliminado."])
            : json_encode(["ok" => false, "mensaje" => "No se encontró ese usuario."]);
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>