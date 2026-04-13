const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const usuariosRoutes = require('./routes/usuariosRoutes');
const authRoutes = require('./routes/authRoutes');
const clasesRoutes = require('./routes/clasesRoutes');
const horariosRoutes = require('./routes/horariosRoutes');
const inscripcionesRoutes = require('./routes/inscripcionesRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clases', clasesRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);

app.get('/api/test', async (req, res) => {
    try {
        const respuesta = await pool.query('SELECT NOW()');
        res.json({ mensaje: "¡La API de TUTODEMY está funcionando!", fecha: respuesta.rows[0] });
    } catch (error) {
        console.error("Error completo:", error);
        res.status(500).json({ error: "Error conectando a la base de datos" });
    }
});

app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});