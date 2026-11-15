DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio INT NOT NULL,
    stock INT NOT NULL,
    imagen TEXT
);

CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(20) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    clienteId VARCHAR(50) NOT NULL,
    total INT NOT NULL,
    detalle TEXT NOT NULL
);

INSERT INTO productos (nombre, descripcion, precio, stock, imagen) 
VALUES 
('Mascarillas Quirúrgicas', 'Mascarilla quirúrgica de 3 pliegues tipo IIR de alta filtración.', 4990, 20, 'https://exom.cl/cdn/shop/files/Mascarilla-Quirurgica-3-Pliegues-Tipo-IIR_b70a80ea-191f-43f1-be4b-855f2f201379_1024x1024.jpg?v=1687021838'),
('Guantes de Procedimiento', 'Guantes de examen desechables para protección clínica.', 6500, 3, 'https://conveniomarco.mercadopublico.cl/media/catalog/product/2/2/2231236.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700'),
('Tanque de Oxígeno', 'Cilindro de oxígeno medicinal portátil con válvula.', 45000, 10, 'https://m.media-amazon.com/images/I/81rlzxvUpIL._AC_UF1000,1000_QL80_.jpg'),
('Jeringas 5 ml', 'Caja de jeringas desechables de 5cc, 100 unidades.', 12500, 50, 'https://www.mayordent.cl/wp-content/uploads/2023/04/JERINGAS-DESECH.-5CC-CRANBERRY-CAJA-100-UDS.png'),
('Tensiómetro Presión Arterial', 'Monitor digital de presión arterial de brazo.', 25990, 15, 'https://detectores.cl/wp-content/uploads/2022/09/114-PRESPER.jpg'),
('Medidor de Glucosa en Sangre', 'Kit monitor de glucosa con tiras reactivas.', 18500, 25, 'https://beyondtype1.org/wp-content/uploads/2024/11/Accu-Chek-Guide-Me-system-1.jpg'),
('Báscula de Peso Médica', 'Báscula mecánica de plataforma con tallímetro.', 65000, 5, 'https://beyondtype1.org/wp-content/uploads/2024/11/Accu-Chek-Guide-Me-system-1.jpg'),
('Alcohol Gel', 'Alcohol gel al 70% con dosificador, 340cc.', 3500, 100, 'https://dipromed.cl/1782-large_default/alcohol-gel-70-340cc.jpg');

INSERT INTO clientes (rut, nombre, email, telefono) VALUES 
('12.345.678-9', 'Juan Pérez', 'juan.perez@email.com', '+56912345678'),
('98.765.432-1', 'Hospital Clínico', 'compras@hospital.cl', '+56987654321');
