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

// Levantar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
});