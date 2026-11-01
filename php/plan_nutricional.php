<?php 
require("conexion.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];  /** inputs del login */
    $calorias = $_POST['calorias'];
    $proteinas = $_POST['proteinas'];
    $carbohidratos = $_POST['carbohidratos'];
    $grasas = $_POST['grasas'];
    $modelo3d = $_FILES['modelo3d']['name'] ?? '';  

//Insertar en la base de datos
$sql = "INSERT INTO plan_nutricional(
            nombre,
            calorias,
            proteinas,
            carbohidratos,
            grasas,
            modelo3d
        )
        VALUES (
            '$nombre',
            '$calorias',
            '$proteinas',
            '$carbohidratos',
            '$grasas',
            '$modelo3d'
        )";

    if ($conn->query($sql) === TRUE){
        echo "Registro guardado correctamente.";
    } else {
        echo "Erro: " . $sql . "<br>" . $conn->error;
    }
}
$conn->close();
?>