<?php
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

function guardarModelo() {
    if (empty($_FILES['modelo3d']) || $_FILES['modelo3d']['error'] === UPLOAD_ERR_NO_FILE) {
        return ['ok' => true, 'ruta' => null];
    }
    $f = $_FILES['modelo3d'];
    if ($f['error'] !== UPLOAD_ERR_OK) {
        return ['ok' => false, 'mensaje' => 'Error al subir el archivo (código ' . $f['error'] . ').'];
    }
    if ($f['size'] > 25 * 1024 * 1024) {
        return ['ok' => false, 'mensaje' => 'El archivo supera los 25 MB.'];
    }
    $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['glb', 'gltf', 'obj', 'png', 'jpg', 'jpeg', 'webp', 'gif'])) {
        return ['ok' => false, 'mensaje' => 'Formato de archivo no permitido.'];
    }
    $dir = __DIR__ . '/../uploads/platos';
    if (!is_dir($dir)) { mkdir($dir, 0777, true); }
    $nombre = 'plato_' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $nombre)) {
        return ['ok' => false, 'mensaje' => 'No se pudo guardar el archivo en el servidor.'];
    }
    return ['ok' => true, 'ruta' => 'uploads/platos/' . $nombre];
}

$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'listar';

if ($accion !== 'listar' && empty($_SESSION['es_admin'])) {
    echo json_encode(["ok" => false, "mensaje" => "Solo el administrador puede hacer esto."]);
    exit;
}

switch ($accion) {

    case 'listar':
        $res = $conn->query("SELECT * FROM plan_nutricional ORDER BY id_plan_nutricional DESC");
        echo json_encode(["ok" => true, "platos" => $res->fetch_all(MYSQLI_ASSOC)]);
        break;

    case 'crear':
        $nombre = trim($_POST['nombre'] ?? '');
        $categoria = $_POST['categoria'] ?? '';
        $calorias = (int)($_POST['calorias'] ?? 0);
        $proteinas = (float)($_POST['proteinas'] ?? 0);
        $carbohidratos = (float)($_POST['carbohidratos'] ?? 0);
        $grasas = (float)($_POST['grasas'] ?? 0);
        $imc = $_POST['imc'] ?? 'bnso';
        $objetivos = $_POST['objetivos'] ?? 'pgmt';

        if ($nombre === '' || $categoria === '') {
            echo json_encode(["ok" => false, "mensaje" => "Nombre y categoría son obligatorios."]);
            break;
        }

        $m = guardarModelo();
        if (!$m['ok']) { echo json_encode($m); break; }
        $modelo3d = $m['ruta'] ?? '';

        $stmt = $conn->prepare("INSERT INTO plan_nutricional
            (nombre, categoria, calorias, proteinas, carbohidratos, grasas, imc, objetivos, modelo3d)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssidddsss", $nombre, $categoria, $calorias, $proteinas, $carbohidratos, $grasas, $imc, $objetivos, $modelo3d);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Plato creado.", "id" => $conn->insert_id])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    case 'actualizar':
        $id = (int)($_POST['id'] ?? 0);
        $nombre = trim($_POST['nombre'] ?? '');
        $categoria = $_POST['categoria'] ?? '';
        $calorias = (int)($_POST['calorias'] ?? 0);
        $proteinas = (float)($_POST['proteinas'] ?? 0);
        $carbohidratos = (float)($_POST['carbohidratos'] ?? 0);
        $grasas = (float)($_POST['grasas'] ?? 0);
        $imc = $_POST['imc'] ?? 'bnso';
        $objetivos = $_POST['objetivos'] ?? 'pgmt';

        if ($id <= 0 || $nombre === '' || $categoria === '') {
            echo json_encode(["ok" => false, "mensaje" => "Faltan datos."]);
            break;
        }
        $stmt = $conn->prepare("UPDATE plan_nutricional
            SET nombre=?, categoria=?, calorias=?, proteinas=?, carbohidratos=?, grasas=?, imc=?, objetivos=?
            WHERE id_plan_nutricional=?");
        $stmt->bind_param("ssidddssi", $nombre, $categoria, $calorias, $proteinas, $carbohidratos, $grasas, $imc, $objetivos, $id);

        $m = guardarModelo();
        if (!$m['ok']) { echo json_encode($m); break; }
        if ($m['ruta']) {
            $s2 = $conn->prepare("UPDATE plan_nutricional SET modelo3d=? WHERE id_plan_nutricional=?");
            $s2->bind_param("si", $m['ruta'], $id);
            $s2->execute();
        }

        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Plato actualizado."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    case 'eliminar':
        $id = (int)($_POST['id'] ?? 0);

        // Borrar también el archivo 3D del servidor
        $q = $conn->prepare("SELECT modelo3d FROM plan_nutricional WHERE id_plan_nutricional = ?");
        $q->bind_param("i", $id);
        $q->execute();
        $fila = $q->get_result()->fetch_assoc();
        if ($fila && $fila['modelo3d'] && strpos($fila['modelo3d'], 'uploads/platos/') === 0) {
            @unlink(__DIR__ . '/../' . $fila['modelo3d']);
        }

        $stmt = $conn->prepare("DELETE FROM plan_nutricional WHERE id_plan_nutricional = ?");
        $stmt->bind_param("i", $id);
        echo ($stmt->execute() && $stmt->affected_rows > 0)
            ? json_encode(["ok" => true, "mensaje" => "Plato eliminado."])
            : json_encode(["ok" => false, "mensaje" => "No se encontró ese plato."]);
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>