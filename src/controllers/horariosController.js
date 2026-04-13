const pool = require('../config/db');

const crearHorario = async (req, res) => {
    const { clase_id, dia_semana, hora_inicio, hora_fin } = req.body;

    try {
        const nuevoHorario = await pool.query(
            `INSERT INTO horarios (clase_id, dia_semana, hora_inicio, hora_fin) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [clase_id, dia_semana, hora_inicio, hora_fin]
        );

        res.json({
            mensaje: "¡Horario asignado exitosamente a la clase!",
            horario: nuevoHorario.rows[0]
        });

    } catch (error) {
        console.error("Error en DB:", error);
        res.status(500).json({ error: "Error al guardar el horario en la base de datos." });
    }
};

module.exports = { crearHorario };