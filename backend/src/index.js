//INTEGRANTES:
// - Matias Aguilera Ibarra
// - Benjamin Jimenez Chandia
// - Cristian Jimenez Fuentes
// - Bairon Muñoz Sepúlveda
// - Valentina Zuñiga Salamanca

const express = require('express');
const pool = require('./db');

const app = express();
const port = 3000;

app.use(express.json());


//Metodo post para usuarios (necesario para los demas 10 endpoints de la entrega)
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

//=================================================================================================================
//Primera entrega de 10 Endpoints:
//=================================================================================================================

//Metodo POST de categorias:
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

//Metodo POST de movimientos:
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

//=================================================================================================================

//Metodo PUT de usuarios por id:
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

//Metodo PUT de movimientos por id:
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

//=================================================================================================================

//Metodo Get para listar povimientos por usuario
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

//Metodo Get de resumen financiero por usuario
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

//=================================================================================================================

// PATCH - Cambiar solo la descripción de un movimiento
app.patch('/api/movimientos/:id/descripcion', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion } = req.body;

        if (!descripcion) {
            return res.status(400).json({
                mensaje: "Error: la descripción es obligatoria"
            });
        }

        const query = `
            UPDATE movimientos 
            SET descripcion = $1 
            WHERE id = $2 
            RETURNING *
        `;
        const values = [descripcion, id];
        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Movimiento no encontrado" });
        }

        res.status(200).json({
            mensaje: "Descripción actualizada correctamente",
            movimiento: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al actualizar la descripción: ' + error.message);
    }
});

// PATCH - Cambiar solo el monto de un movimiento
app.patch('/api/movimientos/:id/monto', async (req, res) => {
    try {
        const { id } = req.params;
        const { monto } = req.body;

        if (monto === undefined || monto === null) {
            return res.status(400).json({
                mensaje: "Error: el monto es obligatorio"
            });
        }

        if (isNaN(monto) || Number(monto) <= 0) {
            return res.status(400).json({
                mensaje: "Error: el monto debe ser un número mayor a 0"
            });
        }

        const query = `
            UPDATE movimientos 
            SET monto = $1 
            WHERE id = $2 
            RETURNING *
        `;
        const values = [monto, id];
        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Movimiento no encontrado" });
        }

        res.status(200).json({
            mensaje: "Monto actualizado correctamente",
            movimiento: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al actualizar el monto: ' + error.message);
    }
});


// DELETE - Eliminar una transacción (movimiento) por ID
app.delete('/api/movimientos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM movimientos WHERE id = $1 RETURNING *';
        const resultado = await pool.query(query, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Transacción no encontrada" });
        }

        res.status(200).json({
            mensaje: "Transacción eliminada correctamente",
            movimiento: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al eliminar la transacción: ' + error.message);
    }
});

// DELETE - Eliminar una categoría por ID
app.delete('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;

        //Nota: Hay una restriccion
        //La base de datos podria dar error por restriccion de la llave foranea porque el sistema protege los datos
        //no se borra una categoria si todavia hay registros de gastos que dependan de ella
        const query = 'DELETE FROM categorias WHERE id = $1 RETURNING *';
        const resultado = await pool.query(query, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Categoría no encontrada" });
        }

        res.status(200).json({
            mensaje: "Categoría eliminada correctamente",
            categoria: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al eliminar la categoría: ' + error.message);
    }
});


//=================================================================================================================
//Segunda entrega de 10 Endpoints:
//=================================================================================================================

// POST - Crear un presupuesto mensual
// El usuario define un tope de gasto para una categoría y un mes/año específico
app.post('/api/presupuestos', async (req, res) => {
    try {
        const { usuario_id, categoria_id, monto_limite, mes, anio } = req.body;

        if (!usuario_id || !categoria_id || !monto_limite || !mes || !anio) {
            return res.status(400).json({
                mensaje: "Error: usuario_id, categoria_id, monto_limite, mes y anio son obligatorios"
            });
        }

        if (mes < 1 || mes > 12) {
            return res.status(400).json({
                mensaje: "Error: el mes debe ser un valor entre 1 y 12"
            });
        }

        if (monto_limite <= 0) {
            return res.status(400).json({
                mensaje: "Error: el monto_limite debe ser mayor a 0"
            });
        }

        const query = `
            INSERT INTO presupuestos (usuario_id, categoria_id, monto_limite, mes, anio)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [usuario_id, categoria_id, monto_limite, mes, anio];
        const resultado = await pool.query(query, values);

        res.status(201).json({
            mensaje: "Presupuesto creado correctamente",
            presupuesto: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al crear el presupuesto: ' + error.message);
    }
});

// POST - Crear una meta de ahorro
// Registra un objetivo financiero a largo plazo con un monto objetivo y fecha límite
app.post('/api/metas', async (req, res) => {
    try {
        const { usuario_id, nombre, monto_objetivo, fecha_limite } = req.body;

        if (!usuario_id || !nombre || !monto_objetivo) {
            return res.status(400).json({
                mensaje: "Error: usuario_id, nombre y monto_objetivo son obligatorios"
            });
        }

        if (monto_objetivo <= 0) {
            return res.status(400).json({
                mensaje: "Error: el monto_objetivo debe ser mayor a 0"
            });
        }

        const query = `
            INSERT INTO metas (usuario_id, nombre, monto_objetivo, monto_ahorrado, fecha_limite)
            VALUES ($1, $2, $3, 0, $4)
            RETURNING *
        `;
        const values = [usuario_id, nombre, monto_objetivo, fecha_limite || null];
        const resultado = await pool.query(query, values);

        res.status(201).json({
            mensaje: "Meta de ahorro creada correctamente",
            meta: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al crear la meta: ' + error.message);
    }
});

//=================================================================================================================

// GET - Listar presupuestos de un usuario con estado "en verde" o "en rojo"
// Compara el gasto real del mes/año con el monto límite configurado
app.get('/api/presupuestos/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const query = `
            SELECT
                p.id,
                p.usuario_id,
                p.categoria_id,
                c.nombre AS categoria_nombre,
                c.tipo AS categoria_tipo,
                p.monto_limite,
                p.mes,
                p.anio,
                COALESCE(SUM(m.monto), 0) AS gasto_actual,
                CASE
                    WHEN COALESCE(SUM(m.monto), 0) <= p.monto_limite THEN 'en verde'
                    ELSE 'en rojo'
                END AS estado
            FROM presupuestos p
            JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN movimientos m
                ON m.categoria_id = p.categoria_id
                AND m.usuario_id = p.usuario_id
                AND EXTRACT(MONTH FROM m.fecha) = p.mes
                AND EXTRACT(YEAR FROM m.fecha) = p.anio
            WHERE p.usuario_id = $1
            GROUP BY p.id, p.usuario_id, p.categoria_id, c.nombre, c.tipo, p.monto_limite, p.mes, p.anio
            ORDER BY p.anio DESC, p.mes DESC
        `;
        const resultado = await pool.query(query, [usuario_id]);

        res.status(200).json(resultado.rows);

    } catch (error) {
        res.status(500).send('Error al obtener los presupuestos: ' + error.message);
    }
});

// GET - Listar metas de ahorro de un usuario con progreso acumulado
// Devuelve cada meta con el porcentaje de avance calculado
app.get('/api/metas/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const query = `
            SELECT
                id,
                usuario_id,
                nombre,
                monto_objetivo,
                monto_ahorrado,
                fecha_limite,
                ROUND((monto_ahorrado * 100.0 / NULLIF(monto_objetivo, 0)), 2) AS porcentaje_progreso,
                CASE
                    WHEN monto_ahorrado >= monto_objetivo THEN 'completada'
                    WHEN fecha_limite IS NOT NULL AND fecha_limite < CURRENT_DATE THEN 'vencida'
                    ELSE 'en progreso'
                END AS estado
            FROM metas
            WHERE usuario_id = $1
            ORDER BY fecha_limite ASC NULLS LAST
        `;
        const resultado = await pool.query(query, [usuario_id]);

        res.status(200).json(resultado.rows);

    } catch (error) {
        res.status(500).send('Error al obtener las metas: ' + error.message);
    }
});

//=================================================================================================================

// PUT - Actualizar presupuesto completo
// Reemplaza la configuración completa: monto límite, mes/año y categoría
app.put('/api/presupuestos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { categoria_id, monto_limite, mes, anio } = req.body;

        if (!categoria_id || !monto_limite || !mes || !anio) {
            return res.status(400).json({
                mensaje: "Error: categoria_id, monto_limite, mes y anio son obligatorios"
            });
        }

        if (mes < 1 || mes > 12) {
            return res.status(400).json({
                mensaje: "Error: el mes debe ser un valor entre 1 y 12"
            });
        }

        const query = `
            UPDATE presupuestos
            SET categoria_id = $1, monto_limite = $2, mes = $3, anio = $4
            WHERE id = $5
            RETURNING *
        `;
        const values = [categoria_id, monto_limite, mes, anio, id];
        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Presupuesto no encontrado" });
        }

        res.status(200).json({
            mensaje: "Presupuesto actualizado correctamente",
            presupuesto: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al actualizar el presupuesto: ' + error.message);
    }
});

// PUT - Actualizar meta de ahorro completa
// Modifica todos los parámetros base: nombre, monto objetivo y fecha límite
app.put('/api/metas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, monto_objetivo, fecha_limite } = req.body;

        if (!nombre || !monto_objetivo) {
            return res.status(400).json({
                mensaje: "Error: nombre y monto_objetivo son obligatorios"
            });
        }

        if (monto_objetivo <= 0) {
            return res.status(400).json({
                mensaje: "Error: el monto_objetivo debe ser mayor a 0"
            });
        }

        const query = `
            UPDATE metas
            SET nombre = $1, monto_objetivo = $2, fecha_limite = $3
            WHERE id = $4
            RETURNING *
        `;
        const values = [nombre, monto_objetivo, fecha_limite || null, id];
        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Meta no encontrada" });
        }

        res.status(200).json({
            mensaje: "Meta actualizada correctamente",
            meta: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al actualizar la meta: ' + error.message);
    }
});

//=================================================================================================================

// PATCH - Modificar solo el monto límite de un presupuesto
// Ajusta rápidamente el tope sin alterar categoría ni fechas
app.patch('/api/presupuestos/:id/monto', async (req, res) => {
    try {
        const { id } = req.params;
        const { monto_limite } = req.body;

        if (monto_limite === undefined || monto_limite === null) {
            return res.status(400).json({
                mensaje: "Error: el monto_limite es obligatorio"
            });
        }

        if (isNaN(monto_limite) || Number(monto_limite) <= 0) {
            return res.status(400).json({
                mensaje: "Error: el monto_limite debe ser un número mayor a 0"
            });
        }

        const query = `
            UPDATE presupuestos
            SET monto_limite = $1
            WHERE id = $2
            RETURNING *
        `;
        const values = [monto_limite, id];
        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Presupuesto no encontrado" });
        }

        res.status(200).json({
            mensaje: "Monto límite actualizado correctamente",
            presupuesto: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al actualizar el monto límite: ' + error.message);
    }
});

// PATCH - Abonar saldo a una meta de ahorro
// Suma un abono al monto_ahorrado acumulado (monto_ahorrado = monto_ahorrado + abono)
app.patch('/api/metas/:id/ahorrado', async (req, res) => {
    try {
        const { id } = req.params;
        const { abono } = req.body;

        if (abono === undefined || abono === null) {
            return res.status(400).json({
                mensaje: "Error: el abono es obligatorio"
            });
        }

        if (isNaN(abono) || Number(abono) <= 0) {
            return res.status(400).json({
                mensaje: "Error: el abono debe ser un número mayor a 0"
            });
        }

        const query = `
            UPDATE metas
            SET monto_ahorrado = monto_ahorrado + $1
            WHERE id = $2
            RETURNING *
        `;
        const values = [abono, id];
        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Meta no encontrada" });
        }

        res.status(200).json({
            mensaje: "Abono registrado correctamente",
            meta: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al registrar el abono: ' + error.message);
    }
});

//=================================================================================================================

// DELETE - Eliminar un presupuesto por ID
// Remueve el límite mensual para que deje de alertar al usuario
app.delete('/api/presupuestos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM presupuestos WHERE id = $1 RETURNING *';
        const resultado = await pool.query(query, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Presupuesto no encontrado" });
        }

        res.status(200).json({
            mensaje: "Presupuesto eliminado correctamente",
            presupuesto: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al eliminar el presupuesto: ' + error.message);
    }
});

// DELETE - Eliminar una meta de ahorro por ID
// Cancela el objetivo y lo borra de la base de datos de manera definitiva
app.delete('/api/metas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM metas WHERE id = $1 RETURNING *';
        const resultado = await pool.query(query, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Meta no encontrada" });
        }

        res.status(200).json({
            mensaje: "Meta eliminada correctamente",
            meta: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).send('Error al eliminar la meta: ' + error.message);
    }
});



// Levantar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
});