<?php
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

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
        $modelo3d = $_FILES['modelo3d']['name'] ?? '';

        if ($nombre === '' || $categoria === '') {
            echo json_encode(["ok" => false, "mensaje" => "Nombre y categoría son obligatorios."]);
            break;
        }
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
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Plato actualizado."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    case 'eliminar':
        $id = (int)($_POST['id'] ?? 0);
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