const express = require('express');
const pool = require('./db');

const app = express();
const port = 3000;

app.use(express.json());

//ENDPOINT NECESARIO PARA LOS DEMÁS SOLICITADOS
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nombre_completo, email, telefono } = req.body;

        if (!nombre_completo || !email) {
            return res.status(400).json({
                message: "Error: El nombre y el email son obligatorios"
            })
        }

        const query = `
            INSERT INTO usuarios (nombre_completo, email, telefono) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;

        const values = [nombre_completo, email, telefono];

        const resultado = await pool.query(query, values);

        res.status(201).json({
            message: "Usuario agregado correctamente",
            usuario: resultado.rows[0]
        })

    } catch (error) {
        res.status(500).send('Error al agregar el usuario ' + error.message);
    }
});

//Primer endpoint para la primera entrega
//Post de categorias
app.post('/api/categorias', async (req, res) => {
    try {
        const { usuario_id, nombre, tipo, descripcion } = req.body;

        if (!usuario_id || !nombre || !tipo) {
            return res.status(400).json({
                mensaje: "Error: usuario_id, nombre y tipo son obligatorios"
            });
        }

        const query = `
            INSERT INTO categorias (usuario_id, nombre, tipo, descripcion) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `;
        const values = [usuario_id, nombre, tipo, descripcion];
        const resultado = await pool.query(query, values);

        res.status(201).json({
            mensaje: "Categoría agregada correctamente",
            categoria: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al agregar la categoria ' + error.message);
    }
});

//Primer endpoint para la primera entrega
//Post de Movimientos
app.post('/api/movimientos', async (req, res) => {
    try {
        const { usuario_id, categoria_id, monto, descripcion } = req.body;

        if (!usuario_id || !categoria_id || !monto || !descripcion) {
            return res.status(400).json({
                mensaje: "Error: usuario_id, categoria_id, monto y descripcion son obligatorios"
            });
        }

        const query = `
            INSERT INTO movimientos (usuario_id, categoria_id, monto, descripcion) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `;
        const values = [usuario_id, categoria_id, monto, descripcion];
        const resultado = await pool.query(query, values);

        res.status(201).json({
            mensaje: "Movimiento registrado con éxito",
            movimiento: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al registrar el movimiento: ' + error.message);
    }
});

// Levantar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
});