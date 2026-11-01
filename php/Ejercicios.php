    <?php 
    require("conexion.php");

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $nombreEjercicio = $_POST['nombreEjercicio'];  /** inputs de Ejercicios */
        $series = $_POST['series'];
        $repeticiones = $_POST['repeticiones'];
        $impacto = $_POST['impacto'];
        $enfoque = $_POST['enfoque'];
        $videoEjercicio = $_POST['videoEjercicio'];

    //Insertar en la base de datos
    $sql = "INSERT INTO ejercicios(
                nombreEjercicio,
                series,
                repeticiones,
                impacto,
                enfoque,
                videoEjercicio
            )
            VALUES (
                '$nombreEjercicio',
                '$series',
                '$repeticiones',
                '$impacto',
                '$enfoque',
                '$videoEjercicio'
            )";

        if ($conn->query($sql) === TRUE){
            echo "Registro guardado correctamente.";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    }
    $conn->close();
    ?>