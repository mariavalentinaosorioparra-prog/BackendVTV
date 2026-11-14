<?php
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

$yo = $_SESSION['id_usuario'] ?? 0;
$esAdmin = !empty($_SESSION['es_admin']);
$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'mias';

$TIPOS = ['alergia', 'discapacidad', 'lesion', 'condicion', 'otro'];
$DESTINOS = ['entrenador', 'nutriologo', 'ambos'];

if (!$yo) {
    echo json_encode(["ok" => false, "mensaje" => "Debes iniciar sesión."]);
    exit;
}
if (in_array($accion, ['listar', 'responder']) && !$esAdmin) {
    echo json_encode(["ok" => false, "mensaje" => "Solo el administrador puede hacer esto."]);
    exit;
}

switch ($accion) {

    // SELECT (usuario): mis reportes
    case 'mias':
        $stmt = $conn->prepare("SELECT id, tipo, dirigido_a, descripcion, estado, respuesta, fecha, fecha_respuesta
                                FROM sugerencias WHERE id_usuario = ? ORDER BY fecha DESC");
        $stmt->bind_param("i", $yo);
        $stmt->execute();
        echo json_encode(["ok" => true, "sugerencias" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
        break;

    // INSERT (usuario): nuevo reporte
    case 'crear':
        $tipo = $_POST['tipo'] ?? '';
        $dest = $_POST['dirigido_a'] ?? 'ambos';
        $desc = trim($_POST['descripcion'] ?? '');
        if (!in_array($tipo, $TIPOS) || !in_array($dest, $DESTINOS)) {
            echo json_encode(["ok" => false, "mensaje" => "Selecciona el tipo y a quién va dirigido."]);
            break;
        }
        if (mb_strlen($desc) < 5 || mb_strlen($desc) > 1000) {
            echo json_encode(["ok" => false, "mensaje" => "La descripción debe tener entre 5 y 1000 caracteres."]);
            break;
        }
        $stmt = $conn->prepare("INSERT INTO sugerencias (id_usuario, tipo, dirigido_a, descripcion) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isss", $yo, $tipo, $dest, $desc);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Enviado. Tu entrenador / nutriólogo lo revisará."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // DELETE: el usuario borra los suyos; el admin cualquiera
    case 'eliminar':
        $id = (int)($_POST['id'] ?? 0);
        if ($esAdmin) {
            $stmt = $conn->prepare("DELETE FROM sugerencias WHERE id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $stmt = $conn->prepare("DELETE FROM sugerencias WHERE id = ? AND id_usuario = ?");
            $stmt->bind_param("ii", $id, $yo);
        }
        echo ($stmt->execute() && $stmt->affected_rows > 0)
            ? json_encode(["ok" => true, "mensaje" => "Reporte eliminado."])
            : json_encode(["ok" => false, "mensaje" => "No se encontró ese reporte."]);
        break;

    // SELECT (admin): todos, con filtros opcionales ?dirigido=entrenador|nutriologo&estado=pendiente|revisado
    case 'listar':
        $dest = $_GET['dirigido'] ?? '';
        $estado = $_GET['estado'] ?? '';
        $where = []; $tipos = ''; $params = [];
        if (in_array($dest, ['entrenador', 'nutriologo'])) {
            $where[] = "(s.dirigido_a = ? OR s.dirigido_a = 'ambos')";
            $tipos .= 's'; $params[] = $dest;
        }
        if (in_array($estado, ['pendiente', 'revisado'])) {
            $where[] = "s.estado = ?";
            $tipos .= 's'; $params[] = $estado;
        }
        $sql = "SELECT s.id, s.tipo, s.dirigido_a, s.descripcion, s.estado, s.respuesta, s.fecha, s.fecha_respuesta, u.correo
                FROM sugerencias s JOIN usuarios u ON u.id = s.id_usuario" .
               ($where ? " WHERE " . implode(" AND ", $where) : "") .
               " ORDER BY s.estado = 'pendiente' DESC, s.fecha DESC";
        $stmt = $conn->prepare($sql);
        if ($params) $stmt->bind_param($tipos, ...$params);
        $stmt->execute();
        $filas = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $pend = (int)$conn->query("SELECT COUNT(*) FROM sugerencias WHERE estado = 'pendiente'")->fetch_row()[0];
        echo json_encode(["ok" => true, "sugerencias" => $filas, "pendientes" => $pend]);
        break;

    // UPDATE (admin): responder y marcar como revisado
    case 'responder':
        $id = (int)($_POST['id'] ?? 0);
        $resp = trim($_POST['respuesta'] ?? '');
        if ($id <= 0) {
            echo json_encode(["ok" => false, "mensaje" => "Reporte no válido."]);
            break;
        }
        if ($resp === '' || mb_strlen($resp) > 1000) {
            echo json_encode(["ok" => false, "mensaje" => "La respuesta no puede quedar vacía ni pasar de 1000 caracteres."]);
            break;
        }
        $stmt = $conn->prepare("UPDATE sugerencias SET respuesta = ?, estado = 'revisado', fecha_respuesta = NOW() WHERE id = ?");
        $stmt->bind_param("si", $resp, $id);
        echo ($stmt->execute() && $stmt->affected_rows > 0)
            ? json_encode(["ok" => true, "mensaje" => "Marcado como revisado."])
            : json_encode(["ok" => false, "mensaje" => "No se encontró ese reporte."]);
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>