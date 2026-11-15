const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'medistock',
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL en XAMPP.', err.message);
        return;
    }
    console.log("🐬 Servidor conectado a MySQL (XAMPP) de forma exitosa.");

    const initSQL = `
        CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10,2) NOT NULL,
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
            total DECIMAL(12,2) NOT NULL,
            detalle TEXT NOT NULL
        );
    `;

    db.query(initSQL, (err) => {
        if (err) console.error("Error creando tablas:", err);

        db.query("SELECT COUNT(*) AS count FROM productos", (err, rows) => {
            if (!err && rows[0].count === 0) {
                const queryProductos = `INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES ?`;
                const valoresProductos = [
                    ['Mascarillas Quirúrgicas', 'Caja de 50 unidades, tres pliegues.', 4990, 20, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500'],
                    ['Guantes de Nitrilo', 'Caja de 100 unidades.', 8990, 3, 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500']
                ];
                db.query(queryProductos, [valoresProductos]);
            }
        });

        db.query("SELECT COUNT(*) AS count FROM clientes", (err, rows) => {
            if (!err && rows[0].count === 0) {
                const queryClientes = `INSERT INTO clientes (rut, nombre, email, telefono) VALUES ?`;
                const valoresClientes = [
                    ['12.345.678-9', 'Juan Pérez', 'juan.perez@email.com', '+56912345678'],
                    ['98.765.432-1', 'Hospital Clínico', 'compras@hospital.cl', '+56987654321']
                ];
                db.query(queryClientes, [valoresClientes]);
            }
        });
    });
});

function procesarVenta(clienteId, detalleCarrito, total, callback) {
    const ids = detalleCarrito.map(item => item.id);
    const placeholders = ids.map(() => '?').join(',');

    db.query(`SELECT * FROM productos WHERE id IN (${placeholders})`, ids, (err, rows) => {
        if (err) return callback(err);

        for (let item of detalleCarrito) {
            const productoDb = rows.find(p => p.id === item.id);
            if (!productoDb || productoDb.stock < item.cantidad) {
                return callback(new Error(`Stock insuficiente para el producto: ${productoDb ? productoDb.nombre : 'ID ' + item.id}`));
            }
        }

        db.beginTransaction(err => {
            if (err) return callback(err);

            let queriesCompletadas = 0;
            let huboError = false;

            detalleCarrito.forEach(item => {
                db.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [item.cantidad, item.id], (err) => {
                    if (err && !huboError) {
                        huboError = true;
                        return db.rollback(() => callback(err));
                    }
                    queriesCompletadas++;

                    if (queriesCompletadas === detalleCarrito.length && !huboError) {
                        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
                        const detalleJson = JSON.stringify(detalleCarrito); 
                        const queryVenta = `INSERT INTO ventas (fecha, clienteId, total, detalle) VALUES (?, ?, ?, ?)`;

                        db.query(queryVenta, [fecha, clienteId || "Invitado", total, detalleJson], (err, result) => {
                            if (err) return db.rollback(() => callback(err));
                            
                            db.commit(err => {
                                if (err) return db.rollback(() => callback(err));
                                callback(null, {
                                    id: result.insertId,
                                    fecha,
                                    clienteId: clienteId || "Invitado",
                                    total,
                                    detalle: detalleCarrito
                                });
                            });
                        });
                    }
                });
            });
        });
    });
}

app.get('/api/v1/productos', (req, res) => {
    db.query("SELECT * FROM productos", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const productosFormateados = rows.map(p => ({
            ...p,
            precio: Number(p.precio)
        }));
        res.json(productosFormateados);
    });
});

app.post('/api/v1/productos', (req, res) => {
    const { nombre, descripcion, precio, stock, imagen } = req.body;
    const query = `INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES (?, ?, ?, ?, ?)`;
    
    db.query(query, [nombre, descripcion, precio, stock, imagen], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, nombre, descripcion, precio, stock, imagen });
    });
});

app.put('/api/v1/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const campos = Object.keys(req.body);
    if (campos.length === 0) return res.status(400).json({ error: "No hay campos para actualizar" });

    const asignaciones = campos.map(campo => `${campo} = ?`).join(', ');
    const valores = campos.map(campo => req.body[campo]);
    valores.push(id);

    const query = `UPDATE productos SET ${asignaciones} WHERE id = ?`;
    db.query(query, valores, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.query("SELECT * FROM productos WHERE id = ?", [id], (err, rows) => {
            if (err || rows.length === 0) return res.status(404).json({ mensaje: "Producto no encontrado" });
            res.json(rows[0]);
        });
    });
});

app.delete('/api/v1/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.query(`DELETE FROM productos WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Producto eliminado" });
    });
});

app.get('/api/v1/ventas', (req, res) => {
    // Capturamos el filtro que nos envíe el frontend por la URL
    const { periodo } = req.query; 

    let query = "SELECT * FROM ventas";

    // Aplicamos filtros de fecha usando funciones nativas de MySQL
    if (periodo === 'diario') {
        // Solo las ventas donde la fecha coincida con hoy
        query += " WHERE DATE(fecha) = CURDATE()";
    } else if (periodo === 'mensual') {
        // Ventas que coincidan con el mes y año actuales
        query += " WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())";
    } else if (periodo === 'anual') {
        // Ventas de todo el año en curso
        query += " WHERE YEAR(fecha) = YEAR(CURDATE())";
    }

    // Ordenamos siempre de la venta más reciente a la más antigua
    query += " ORDER BY fecha DESC"; 

    db.query(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const ventasFormateadas = rows.map(row => ({
            ...row,
            total: Number(row.total), 
            detalle: JSON.parse(row.detalle)
        }));
        res.json(ventasFormateadas);
    });
});

app.post('/api/v1/ventas', (req, res) => {
    const { clienteId, detalleCarrito, total } = req.body;
    
    procesarVenta(clienteId, detalleCarrito, total, (err, nuevaVenta) => {
        if (err) return res.status(400).json({ mensaje: err.message });
        res.status(201).json({ mensaje: "Venta registrada exitosamente", venta: nuevaVenta });
    });
});

app.get('/api/v1/clientes', (req, res) => {
    db.query("SELECT * FROM clientes", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/v1/clientes', (req, res) => {
    const { rut, nombre, email, telefono } = req.body;
    const query = `INSERT INTO clientes (rut, nombre, email, telefono) VALUES (?, ?, ?, ?)`;
    
    db.query(query, [rut, nombre, email, telefono], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, rut, nombre, email, telefono });
    });
});

app.put('/api/v1/clientes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const campos = Object.keys(req.body);
    if (campos.length === 0) return res.status(400).json({ error: "No hay campos para actualizar" });

    const asignaciones = campos.map(campo => `${campo} = ?`).join(', ');
    const valores = campos.map(campo => req.body[campo]);
    valores.push(id);

    const query = `UPDATE clientes SET ${asignaciones} WHERE id = ?`;
    db.query(query, valores, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.query("SELECT * FROM clientes WHERE id = ?", [id], (err, rows) => {
            if (err || rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json(rows[0]);
        });
    });
});

app.delete('/api/v1/clientes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.query(`DELETE FROM clientes WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cliente eliminado' });
    });
});

app.post('/api/v1/pagos', async (req, res) => {
    
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`=======================================`);
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`=======================================`);
});