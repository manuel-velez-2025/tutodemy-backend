const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrarUsuario = async (req, res) => {
    const { nombres, apellido_paterno, apellido_materno, carrera, correo, contrasena, rol } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        const nuevoUsuario = await pool.query(
            `INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, carrera, correo, contrasena, rol) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nombres, apellido_paterno, apellido_materno, carrera, correo, contrasenaEncriptada, rol]
        );
        res.json({ 
            mensaje: "¡Usuario registrado con éxito!", 
            usuario: nuevoUsuario.rows[0] 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar. Revisa si el correo ya existe." });
    }
};

const loginUsuario = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        
        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }
        
        const usuario = resultado.rows[0];
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
        
        if (!contrasenaValida) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.json({
            mensaje: "¡Bienvenida a TUTODEMY!",
            token: token,
            usuario: {
                id: usuario.id,
                nombres: usuario.nombres,
                apellido_paterno: usuario.apellido_paterno,
                apellido_materno: usuario.apellido_materno, 
                carrera: usuario.carrera,                   
                correo: usuario.correo,                     
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
    }
};

module.exports = { registrarUsuario, loginUsuario };