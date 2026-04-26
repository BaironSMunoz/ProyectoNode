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




// PUT: Actualizar perfil, (los usuarios)
//para este endpoint los campos nombre_completo, email y telefono son obligatorios
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, email, telefono } = req.body;

        const query = `
            UPDATE usuarios 
            SET nombre_completo = $1, email = $2, telefono = $3 
            WHERE id = $4 
            RETURNING *
        `;
        const values = [nombre_completo, email, telefono, id];
        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({
            mensaje: "Perfil actualizado correctamente",
            usuario: resultado.rows[0]
        });
    } catch (error) {
        res.status(500).send('Error al actualizar el perfil: ' + error.message);
    }
});



// PUT: Actualizar datos de transacción
app.put('/api/movimientos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { categoria_id, monto, descripcion } = req.body;

        const query = `
            UPDATE movimientos 
            SET categoria_id = $1, monto = $2, descripcion = $3 
            WHERE id = $4 
            RETURNING *
        `;
        const values = [categoria_id, monto, descripcion, id];
        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Movimiento no encontrado" });
        }

        res.status(200).json({
            mensaje: "Transacción actualizada correctamente",
            movimiento: resultado.rows[0]
        });
    } catch (error) {
        res.status(500).send('Error al actualizar la transacción: ' + error.message);
    }
});

//Get obtenet listado de movimientos por usuario
app.get('/api/movimientos/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const query = 'SELECT * FROM movimientos WHERE usuario_id = $1 ORDER BY fecha DESC';
        const resultado = await pool.query(query, [usuario_id]);

        res.status(200).json(resultado.rows);

    } catch (error) {
        res.status(500).send('No se pudo obtener los movimientos: ' + error.message);
    }
});

//Get de resumen financiero por usuario
app.get('/api/resumen/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const query = `
            SELECT c.tipo, SUM(m.monto) as total
            FROM movimientos m
            JOIN categorias c ON m.categoria_id = c.id
            WHERE m.usuario_id = $1
            GROUP BY c.tipo
        `;
        const resultado = await pool.query(query, [usuario_id]);

        res.status(200).json({
            usuario_id,
            resumen: resultado.rows
        });
    } catch (error) {
        res.status(500).send('No se pudo obtener el resumen financiero: ' + error.message);
    }
});


// Levantar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
});