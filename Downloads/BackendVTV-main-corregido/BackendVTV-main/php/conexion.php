<?php
$servername = "localhost"; //Servidor
$username = "root"; //Usuario de MySQL
$password = ""; //Contraseña
$dbname = "fitapp"; //Nombre de la base de datos

//Crear conexion
$conn = new mysqli($servername, $username, $password, $dbname);

//Verificar conexion
if ($conn->connect_error) {
    die("Conexion fallida: " . $conn->connect_error);
}
?>