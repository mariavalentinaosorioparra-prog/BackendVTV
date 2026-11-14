<?php
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

$yo = $_SESSION['id_usuario'] ?? 0;
$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'listar';

if (!$yo) {
    echo json_encode(["ok" => false, "mensaje" => "Debes iniciar sesión."]);
    exit;
}

switch ($accion) {

    // SELECT: todo mi historial de progreso, del más antiguo al más reciente
    case 'listar':
        $stmt = $conn->prepare("SELECT * FROM progreso_diario WHERE id_usuario = ? ORDER BY fecha");
        $stmt->bind_param("i", $yo);
        $stmt->execute();
        echo json_encode(["ok" => true, "dias" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
        break;

    // INSERT o UPDATE: guarda el resumen de un día (una fila por usuario y fecha)
    case 'guardar':
        $fecha = $_POST['fecha'] ?? '';
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            echo json_encode(["ok" => false, "mensaje" => "Fecha no válida."]);
            break;
        }
        $peso      = (float)($_POST['peso'] ?? 0);
        $peso      = $peso > 0 ? $peso : null;
        $quemadas  = (int)($_POST['calorias_quemadas'] ?? 0);
        $consum    = (int)($_POST['calorias_consumidas'] ?? 0);
        $prot      = (float)($_POST['proteinas_consumidas'] ?? 0);
        $carb      = (float)($_POST['carbohidratos_consumidos'] ?? 0);
        $gras      = (float)($_POST['grasas_consumidas'] ?? 0);
        $comidas   = (int)($_POST['comidas_registradas'] ?? 0);
        $metaK     = (int)($_POST['meta_calorias'] ?? 0);
        $metaP     = (int)($_POST['meta_proteinas'] ?? 0);
        $metaC     = (int)($_POST['meta_carbohidratos'] ?? 0);
        $ejHechos  = (int)($_POST['ejercicios_completados'] ?? 0);
        $ejTotal   = (int)($_POST['ejercicios_totales'] ?? 0);
        $sesion    = !empty($_POST['sesion_completada']) ? 1 : 0;
        $ultimo    = trim($_POST['ultimo_registro'] ?? '');
        $ultimo    = preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $ultimo) ? $ultimo : null;
        $actividad = trim($_POST['ultima_actividad'] ?? '');
        $actividad = $actividad !== '' ? mb_substr($actividad, 0, 150) : null;

        $stmt = $conn->prepare("INSERT INTO progreso_diario
            (id_usuario, fecha, peso, calorias_quemadas, calorias_consumidas,
             proteinas_consumidas, carbohidratos_consumidos, grasas_consumidas, comidas_registradas,
             meta_calorias, meta_proteinas, meta_carbohidratos,
             ejercicios_completados, ejercicios_totales, sesion_completada,
             ultimo_registro, ultima_actividad)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              peso = COALESCE(VALUES(peso), peso),
              calorias_quemadas = VALUES(calorias_quemadas),
              calorias_consumidas = VALUES(calorias_consumidas),
              proteinas_consumidas = VALUES(proteinas_consumidas),
              carbohidratos_consumidos = VALUES(carbohidratos_consumidos),
              grasas_consumidas = VALUES(grasas_consumidas),
              comidas_registradas = VALUES(comidas_registradas),
              meta_calorias = VALUES(meta_calorias),
              meta_proteinas = VALUES(meta_proteinas),
              meta_carbohidratos = VALUES(meta_carbohidratos),
              ejercicios_completados = VALUES(ejercicios_completados),
              ejercicios_totales = VALUES(ejercicios_totales),
              sesion_completada = VALUES(sesion_completada),
              ultimo_registro = COALESCE(VALUES(ultimo_registro), ultimo_registro),
              ultima_actividad = COALESCE(VALUES(ultima_actividad), ultima_actividad)");
        $stmt->bind_param("isdiidddiiiiiiiss",
            $yo, $fecha, $peso, $quemadas, $consum,
            $prot, $carb, $gras, $comidas,
            $metaK, $metaP, $metaC,
            $ejHechos, $ejTotal, $sesion,
            $ultimo, $actividad);
        echo $stmt->execute()
            ? json_encode(["ok" => true, "mensaje" => "Progreso guardado."])
            : json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
        break;

    default:
        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
}
$conn->close();
?>