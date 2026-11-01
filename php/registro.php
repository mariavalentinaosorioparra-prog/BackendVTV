<?php 
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $regNombre = $_POST["regNombre"];
    $regCorreo = $_POST["regCorreo"]; /** inputs de registro.html */
    $regPassword = $_POST["regPassword"];
    $regPasswordConfirmar = $_POST["regPasswordConfirmar"];

    if ($regPassword !== $regPasswordConfirmar) {
        echo json_encode(["ok" => false, "mensaje" => "Las contraseñas no coinciden."]);
    } else {
        // Es administrador si el correo termina en @fitapp.com
        $esAdmin = (strtolower(substr($regCorreo, -11)) === '@fitapp.com') ? 1 : 0;

        //Insertar en la base de datos
        $stmt = $conn->prepare("INSERT INTO usuarios (nombre, correo, password, es_admin) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $regNombre, $regCorreo, $regPassword, $esAdmin);

        if ($stmt->execute()){
            $_SESSION['id_usuario'] = $conn->insert_id;
            $_SESSION['es_admin'] = $esAdmin;
            echo json_encode(["ok" => true, "mensaje" => "Registro guardado correctamente.", "es_admin" => $esAdmin]);
        } else if ($conn->errno == 1062) {
            echo json_encode(["ok" => false, "mensaje" => "Ese correo ya está registrado."]);
        } else {
            echo json_encode(["ok" => false, "mensaje" => "Error: " . $conn->error]);
        }
    }
}
$conn->close();
?>