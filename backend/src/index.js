const express = require('express');
const pool = require('./db'); 

const app = express();
const port = 3000;

app.use(express.json());

// Levantar el servidor
app.listen(port, () => {
    console.log(`Servidor simple funcionando en el puerto: ${port}`);
});