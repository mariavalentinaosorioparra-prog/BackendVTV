<?php 
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $loginCorreo = $_POST['loginCorreo'];  /** inputs del login */
    $loginPassword = $_POST['loginPassword'];

    //Buscar en la base de datos
    $stmt = $conn->prepare("SELECT id, nombre, correo, es_admin FROM usuarios WHERE correo = ? AND password = ?");
    $stmt->bind_param("ss", $loginCorreo, $loginPassword);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado && $resultado->num_rows > 0){
        $u = $resultado->fetch_assoc();
        $_SESSION['id_usuario'] = $u['id'];
        $_SESSION['es_admin'] = (int)$u['es_admin'];

        // Última evaluación del usuario (si existe)
        $evaluacion = null;
        $stmt2 = $conn->prepare("SELECT fechaNacimiento, peso, altura, objetivo, sexo, nivel
                                 FROM evaluacion WHERE id_usuario = ? ORDER BY id DESC LIMIT 1");
        $stmt2->bind_param("i", $u['id']);
        $stmt2->execute();
        $r2 = $stmt2->get_result();
        if ($r2 && $r2->num_rows > 0) { $evaluacion = $r2->fetch_assoc(); }

        echo json_encode([
            "ok" => true,
            "mensaje" => "Inicio de sesión correcto.",
            "nombre" => $u['nombre'],
            "correo" => $u['correo'],
            "es_admin" => (int)$u['es_admin'],
            "evaluacion" => $evaluacion
        ]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Correo o contraseña incorrectos."]);
    }
}
$conn->close();
?>