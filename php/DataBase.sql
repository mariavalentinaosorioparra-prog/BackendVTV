CREATE DATABASE IF NOT EXISTS vtv
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vtv;

CREATE TABLE usuario (
  id_usuario       INT UNSIGNED NOT NULL AUTO_INCREMENT, -- Int Unsigned significa que el valor no puede ser negativo y AUTO_INCREMENT que el valor se incrementa solo
  nombre           VARCHAR(60)  NOT NULL, -- NOT NULL obligatorio
  apellido         VARCHAR(60)  NOT NULL,
  contrasena       VARCHAR(255) NOT NULL,
  correo           VARCHAR(120) NOT NULL,
  fecha_nacimiento DATE         NOT NULL,
  peso             DECIMAL(5,2) NOT NULL, -- (5,2) maximo de 5 digitos y 2 decimales
  altura           DECIMAL(5,1) NOT NULL, -- (5,1) maximo de 5 digitos y 1 decimal
  objetivo         ENUM('perder_peso', 'ganar_peso', 'ganar_masa_muscular', 'mantener_peso') NOT NULL,
  PRIMARY KEY (id_usuario)
); 

CREATE TABLE rutina (
  id_rutina    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario   INT UNSIGNED NOT NULL,
  nombre       VARCHAR(120) NOT NULL,
  descripcion  TEXT         NOT NULL,
  duracion     INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_rutina),
  CONSTRAINT fk_rutina_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE -- Si se elimina un usuario, se eliminan todas sus rutinas 
);

CREATE TABLE ejercicio (
  id_ejercicio    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_rutina       INT UNSIGNED NOT NULL,
  descripcion     TEXT         NOT NULL,
  duracion        INT UNSIGNED NOT NULL,
  grupo_muscular  VARCHAR(60)  NOT NULL,
  PRIMARY KEY (id_ejercicio),
  CONSTRAINT fk_ejercicio_rutina
    FOREIGN KEY (id_rutina) REFERENCES rutina (id_rutina)
    ON DELETE SET NULL
);

CREATE TABLE rutina_ejercicio (
  id_rutina_ejercicio INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_rutina           INT UNSIGNED NOT NULL,
  id_ejercicio        INT UNSIGNED NOT NULL,
  series              TINYINT UNSIGNED NOT NULL,
  repeticiones        TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id_rutina_ejercicio),
  CONSTRAINT fk_re_rutina
    FOREIGN KEY (id_rutina) REFERENCES rutina (id_rutina)
    ON DELETE CASCADE,
  CONSTRAINT fk_re_ejercicio
    FOREIGN KEY (id_ejercicio) REFERENCES ejercicio (id_ejercicio)
    ON DELETE CASCADE -- Si se elimina un ejercicio, se eliminan todas las relaciones con rutinas
);
CREATE TABLE entrenamiento (
  id_entrenamiento  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_rutina         INT UNSIGNED NOT NULL,
  id_usuario        INT UNSIGNED NOT NULL,
  fecha             DATE         NOT NULL,
  duracion          INT UNSIGNED NOT NULL,
  calorias_quemadas INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_entrenamiento),
  CONSTRAINT fk_entrenamiento_rutina
    FOREIGN KEY (id_rutina) REFERENCES rutina (id_rutina)
    ON DELETE CASCADE,
  CONSTRAINT fk_entrenamiento_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE
); 

CREATE TABLE plan_nutricional (
  id_plan_nutricional INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario          INT UNSIGNED NOT NULL,
  id_rutina           INT UNSIGNED NOT NULL,
  nombre              VARCHAR(120) NOT NULL,
  calorias_diarias    INT UNSIGNED NOT NULL,
  descripcion         TEXT         NOT NULL,
  fecha_inicio        DATE         NOT NULL,
  fecha_fin           DATE         NOT NULL,
  PRIMARY KEY (id_plan_nutricional),
  CONSTRAINT fk_plan_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE,
  CONSTRAINT fk_plan_rutina
    FOREIGN KEY (id_rutina) REFERENCES rutina (id_rutina)
    ON DELETE SET NULL
);

CREATE TABLE progreso (
  id_progreso       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario        INT UNSIGNED NOT NULL,
  fecha             DATE         NOT NULL,
  peso              DECIMAL(5,2) NOT NULL,
  porcentaje_grasa  DECIMAL(4,1) NOT NULL,
  observaciones     VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_progreso),
  CONSTRAINT fk_progreso_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE
) 
