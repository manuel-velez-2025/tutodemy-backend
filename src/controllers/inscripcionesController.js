const pool = require('../config/db');

const inscribirClase = async (req, res) => {
    const { clase_id } = req.body;
    const tutorado_id = req.usuario.id;

    try {
        const nuevaInscripcion = await pool.query(
            `INSERT INTO inscripciones (tutorado_id, clase_id, fecha_inscripcion) 
             VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *`,
            [tutorado_id, clase_id]
        );

        res.json({
            mensaje: "¡Inscripción realizada con éxito!",
            detalle: nuevaInscripcion.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar la inscripción." });
    }
};

const obtenerMisInscripciones = async (req, res) => {
    const tutorado_id = req.usuario.id;

    try {
        const query = `
            SELECT 
                i.id AS inscripcion_id,
                c.nombre AS materia,
                c.ubicacion,
                c.precio,
                u.nombres AS tutor_nombre,
                u.apellido_paterno AS tutor_apellido,
                i.fecha_inscripcion
            FROM inscripciones i
            JOIN clases c ON i.clase_id = c.id
            JOIN usuarios u ON c.tutor_id = u.id
            WHERE i.tutorado_id = $1;
        `;
        
        const resultado = await pool.query(query, [tutorado_id]);
        
        if (resultado.rows.length === 0) {
            return res.json({ mensaje: "Aún no te has inscrito a ninguna clase." });
        }

        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener tus inscripciones." });
    }
};
const obtenerMisClasesInscritas = async (req, res) => {
    const alumno_id = req.usuario.id;

    try {
        const query = `
            SELECT 
                c.id, c.nombre, c.ubicacion, c.precio,
                u.nombres AS tutor_nombre,
                i.fecha_inscripcion,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'dia', h.dia_semana,
                            'hora', h.hora_inicio
                        )
                    ) FILTER (WHERE h.id IS NOT NULL), '[]'
                ) AS horarios
            FROM inscripciones i
            JOIN clases c ON i.clase_id = c.id
            JOIN usuarios u ON c.tutor_id = u.id
            LEFT JOIN horarios h ON c.id = h.clase_id
            WHERE i.tutorado_id = $1
            GROUP BY c.id, u.nombres, i.fecha_inscripcion;
        `;
        const respuesta = await pool.query(query, [alumno_id]);
        res.json(respuesta.rows); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener tu calendario de clases." });
    }
};

module.exports = { inscribirClase, obtenerMisInscripciones, obtenerMisClasesInscritas };