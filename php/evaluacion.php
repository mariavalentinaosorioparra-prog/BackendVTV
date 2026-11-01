<?php  
session_start();
require("conexion.php");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fechaNacimiento = $_POST["fechaNacimiento"];
    $peso = $_POST['peso'];  /** inputs de evaluacion.html */
    $altura = $_POST['altura'];
    $objetivo = $_POST['objetivo'];
    $sexo = $_POST['sexo'];
    $nivel = $_POST['nivel'];
    $id_usuario = $_SESSION['id_usuario'] ?? null;

    //Insertar en la base de datos
    $stmt = $conn->prepare("INSERT INTO evaluacion (id_usuario, fechaNacimiento, peso, altura, objetivo, sexo, nivel)
                            VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isddsss", $id_usuario, $fechaNacimiento, $peso, $altura, $objetivo, $sexo, $nivel);

    if ($stmt->execute()){
        echo json_encode(["ok" => true, "mensaje" => "Registro guardado correctamente."]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Error: " . $stmt->error]);
    }
}
$conn->close();
?>