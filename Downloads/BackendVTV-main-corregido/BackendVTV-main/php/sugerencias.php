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
    // 1. EL CLIENTE ENVÍA UNA SUGERENCIA
    case 'crear':
        $mensaje = trim($_POST['mensaje'] ?? '');
        if (empty($mensaje)) {
            echo json_encode(["ok" => false, "mensaje" => "El mensaje no puede estar vacío."]);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO sugerencias_clientes (id_usuario, mensaje) VALUES (?, ?)");
        $stmt->bind_param("is", $yo, $mensaje);
        
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Sugerencia enviada con éxito al equipo de entrenadores."])
            : json_encode(["ok" => false, "mensaje" => "Error al enviar la sugerencia."]);
        break;

    // 2. EL ADMINISTRADOR LISTA TODAS LAS SUGERENCIAS DE LOS CLIENTES
    case 'listar':
        // Verificamos si es admin por seguridad
        $es_admin = $_SESSION['es_admin'] ?? 0;
        if (!$es_admin) {
            echo json_encode(["ok" => false, "mensaje" => "No tienes permisos de administrador."]);
            exit;
        }

        $sql = "SELECT s.id, s.mensaje, s.fecha, u.nombre, u.correo 
                FROM sugerencias_clientes s 
                JOIN usuarios u ON s.id_usuario = u.id 
                ORDER BY s.fecha DESC";
        $resultado = $conn->query($sql);
        
        echo json_encode([
            "ok" => true, 
            "sugerencias" => $resultado ? $resultado->fetch_all(MYSQLI_ASSOC) : []
        ]);
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>