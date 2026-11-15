# MediStock - E-commerce e Inventario

MediStock es una plataforma integral de comercio electrónico orientada a modelos de negocio B2B y B2C. La aplicación permite a los clientes explorar productos y realizar compras, mientras proporciona a los administradores un panel de control para la gestión del inventario y las ventas.

## Funcionalidades Principales

- Roles de Acceso: Vistas y permisos separados dependiendo del tipo de cuenta autentificada (Usuario o Administrador).
- Experiencia de Compra: Exploración de catálogo, gestión de carrito de compras y flujo de checkout completo para la vista de usuario.
- Integración de Pagos: Procesamiento de transacciones integrado con la API de Transbank (Webpay).
- Panel de Administración: Sistema CRUD para la gestión de ítems, control de stock y actualización del catálogo en la vista de administrador.

## Tecnologías Utilizadas

- Frontend: React, Vite, TypeScript, CSS
- Backend: Node.js, JavaScript
- Base de Datos: SQLite
- Pasarela de Pagos: Integración API Transbank

#Configurar la Base de Datos:

Abre XAMPP e inicia los servicios de Apache y MySQL.

Accede a phpMyAdmin (usualmente en http://localhost/phpmyadmin).

Crea la base de datos correspondiente e importa el archivo script_base_datos_actualizado.sql ubicado en la carpeta del backend.
