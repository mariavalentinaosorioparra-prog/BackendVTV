<?php
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

function guardarVideo() {
    if (empty($_FILES['video']) || $_FILES['video']['error'] === UPLOAD_ERR_NO_FILE) {
        return ['ok' => true, 'ruta' => null];
    }
    $f = $_FILES['video'];
    if ($f['error'] !== UPLOAD_ERR_OK) {
        return ['ok' => false, 'mensaje' => 'Error al subir el archivo (código ' . $f['error'] . ').'];
    }
    if ($f['size'] > 25 * 1024 * 1024) {
        return ['ok' => false, 'mensaje' => 'El archivo supera los 25 MB.'];
    }
    $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['mp4', 'webm', 'gif'])) {
        return ['ok' => false, 'mensaje' => 'Formato no permitido (MP4, WebM o GIF).'];
    }
    $dir = __DIR__ . '/../uploads/ejercicios';
    if (!is_dir($dir)) { mkdir($dir, 0777, true); }
    $nombre = 'ej_' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $nombre)) {
        return ['ok' => false, 'mensaje' => 'No se pudo guardar el archivo en el servidor.'];
    }
    return ['ok' => true, 'ruta' => 'uploads/ejercicios/' . $nombre];
}

$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'listar';

// Solo el administrador puede crear, editar o eliminar
if ($accion !== 'listar' && empty($_SESSION['es_admin'])) {
    echo json_encode(["ok" => false, "mensaje" => "Solo el administrador puede hacer esto."]);
    exit;
}

switch ($accion) {

    // ---------- READ ----------
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

    // ---------- CREATE ----------
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

        $v = guardarVideo();
        if (!$v['ok']) { echo json_encode($v); break; }
        $video = $v['ruta'] ?? '';

        $stmt = $conn->prepare("INSERT INTO ejercicios (nombre, grupo, series, reps, impacto, enfoques, compuesto, tecnica, video)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssisssiss", $nombre, $grupo, $series, $reps, $impacto, $enfoques, $compuesto, $tecnica, $video);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Ejercicio creado.", "id" => $conn->insert_id])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // ---------- UPDATE ----------
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

        $v = guardarVideo();
        if (!$v['ok']) { echo json_encode($v); break; }

        $stmt = $conn->prepare("UPDATE ejercicios
                                SET nombre=?, grupo=?, series=?, reps=?, impacto=?, enfoques=?, compuesto=?, tecnica=?
                                WHERE id=?");
        $stmt->bind_param("ssisssisi", $nombre, $grupo, $series, $reps, $impacto, $enfoques, $compuesto, $tecnica, $id);
        $okUpdate = $stmt->execute();

        // Si se subió un video nuevo, reemplaza el anterior
        if ($okUpdate && $v['ruta']) {
            $q = $conn->prepare("SELECT video FROM ejercicios WHERE id = ?");
            $q->bind_param("i", $id);
            $q->execute();
            $fila = $q->get_result()->fetch_assoc();
            if ($fila && $fila['video'] && strpos($fila['video'], 'uploads/ejercicios/') === 0) {
                @unlink(__DIR__ . '/../' . $fila['video']);
            }
            $s2 = $conn->prepare("UPDATE ejercicios SET video=? WHERE id=?");
            $s2->bind_param("si", $v['ruta'], $id);
            $s2->execute();
        }

        echo $okUpdate
            ? json_encode(["ok" => true, "mensaje" => "Ejercicio actualizado."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    // ---------- DELETE ----------
    case 'eliminar':
        $id = (int)($_POST['id'] ?? 0);

        // Borrar también el video del servidor
        $q = $conn->prepare("SELECT video FROM ejercicios WHERE id = ?");
        $q->bind_param("i", $id);
        $q->execute();
        $fila = $q->get_result()->fetch_assoc();
        if ($fila && $fila['video'] && strpos($fila['video'], 'uploads/ejercicios/') === 0) {
            @unlink(__DIR__ . '/../' . $fila['video']);
        }

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