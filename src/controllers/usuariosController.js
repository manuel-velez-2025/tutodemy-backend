const pool = require('../config/db');

const obtenerUsuarios = async (req, res) => {
    try {
        const respuesta = await pool.query('SELECT * FROM usuarios');
        res.json(respuesta.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los usuarios" });
    }
};
const obtenerMiPerfil = async (req, res) => {
    const usuario_id = req.usuario.id;

    try {
        const query = `
            SELECT id, nombres, apellido_paterno, apellido_materno, carrera, correo, rol 
            FROM usuarios 
            WHERE id = $1;
        `;
        const resultado = await pool.query(query, [usuario_id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar el perfil." });
    }
};

const actualizarMiPerfil = async (req, res) => {
    const usuario_id = req.usuario.id;
    const { nombres, apellido_paterno, apellido_materno, carrera } = req.body;

    try {
        const query = `
            UPDATE usuarios 
            SET nombres = $1, 
                apellido_paterno = $2, 
                apellido_materno = $3, 
                carrera = $4
            WHERE id = $5 
            RETURNING id, nombres, apellido_paterno, apellido_materno, carrera, correo, rol;
        `;
        
        const resultado = await pool.query(query, [nombres, apellido_paterno, apellido_materno, carrera, usuario_id]);

        res.json({
            mensaje: "¡Perfil actualizado con éxito!",
            perfil: resultado.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el perfil." });
    }
};

module.exports = { obtenerUsuarios, obtenerMiPerfil, actualizarMiPerfil };