const pool = require('../config/db');

const crearClase = async (req, res) => {
    const tutor_id = req.usuario.id;
    const { nombre, ubicacion, precio, horarios, dia, hora } = req.body; 

    try {
        const queryClase = `
            INSERT INTO clases (tutor_id, nombre, ubicacion, precio) 
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const resClase = await pool.query(queryClase, [tutor_id, nombre, ubicacion, precio]);
        const nuevaClase = resClase.rows[0]; 
        
        if (horarios && horarios.length > 0) {
            for (let h of horarios) {
                await pool.query(
                    `INSERT INTO horarios (clase_id, dia_semana, hora_inicio) VALUES ($1, $2, $3)`,
                    [nuevaClase.id, h.dia || h.dia_semana, h.hora || h.hora_inicio]
                );
            }
        } 
        else if (dia && hora) {
            await pool.query(
                `INSERT INTO horarios (clase_id, dia_semana, hora_inicio) VALUES ($1, $2, $3)`,
                [nuevaClase.id, dia, hora]
            );
        }

        res.json({
            mensaje: "¡Clase y horarios creados con éxito!",
            clase: nuevaClase
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear la clase y su horario." });
    }
};

const obtenerClases = async (req, res) => {
    const alumno_id = req.usuario.id;

    try {
        const query = `
            SELECT 
                c.id, c.nombre, c.ubicacion, c.precio,
                u.nombres AS tutor_nombre,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'dia', h.dia_semana,
                            'hora', h.hora_inicio
                        )
                    ) FILTER (WHERE h.id IS NOT NULL), '[]'
                ) AS horarios
            FROM clases c
            JOIN usuarios u ON c.tutor_id = u.id
            LEFT JOIN horarios h ON c.id = h.clase_id
            WHERE c.id NOT IN (
                SELECT clase_id FROM inscripciones WHERE tutorado_id = $1
            )
            GROUP BY c.id, u.nombres;
        `;
        const respuesta = await pool.query(query, [alumno_id]);
        res.json(respuesta.rows); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las clases." });
    }
};

const obtenerMisClasesCreadas = async (req, res) => {
    const tutor_id = req.usuario.id; 

    try {
        const query = `
            SELECT 
                c.id, c.nombre, c.ubicacion, c.precio,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'dia_semana', h.dia_semana,
                            'hora_inicio', h.hora_inicio,
                            'hora_fin', h.hora_fin
                        )
                    ) FILTER (WHERE h.id IS NOT NULL), '[]'
                ) AS horarios
            FROM clases c
            LEFT JOIN horarios h ON c.id = h.clase_id
            WHERE c.tutor_id = $1
            GROUP BY c.id;
        `;
        const respuesta = await pool.query(query, [tutor_id]);

        res.json(respuesta.rows); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener tus clases" });
    }
};

const obtenerAlumnosPorClase = async (req, res) => {
    const tutor_id = req.usuario.id; 
    const clase_id = req.params.id;  

    try {
        const query = `
            SELECT 
                u.id AS alumno_id, 
                u.nombres, 
                u.apellido_paterno, 
                u.correo,
                u.carrera, 
                i.fecha_inscripcion 
            FROM inscripciones i
            JOIN usuarios u ON i.tutorado_id = u.id
            JOIN clases c ON i.clase_id = c.id
            WHERE i.clase_id = $1 AND c.tutor_id = $2;
        `;
        const resultado = await pool.query(query, [clase_id, tutor_id]);

        if (resultado.rows.length === 0) {
            return res.json({ mensaje: "Aún no hay alumnos inscritos o la clase no te pertenece." });
        }

        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener la lista de alumnos." });
    }
};

const eliminarClase = async (req, res) => {
    const clase_id = req.params.id;
    const tutor_id = req.usuario.id; 

    try {
    
        await pool.query('DELETE FROM horarios WHERE clase_id = $1', [clase_id]);

        const resultado = await pool.query('DELETE FROM clases WHERE id = $1 AND tutor_id = $2 RETURNING *', [clase_id, tutor_id]);
        
        if (resultado.rows.length === 0) {
            return res.status(403).json({ error: "No puedes eliminar esta clase." });
        }

        res.json({ mensaje: "¡Clase y sus horarios eliminados con éxito!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar la clase." });
    }
};

const actualizarClase = async (req, res) => {
    const clase_id = req.params.id;  
    const tutor_id = req.usuario.id; 
    const { nombre, ubicacion, precio, horarios, dia, hora } = req.body; 

    try {
        const queryClase = `
            UPDATE clases SET nombre = $1, ubicacion = $2, precio = $3
            WHERE id = $4 AND tutor_id = $5 RETURNING *;
        `;
        const resClase = await pool.query(queryClase, [nombre, ubicacion, precio, clase_id, tutor_id]);
        
        if (resClase.rows.length === 0) {
            return res.status(403).json({ error: "No puedes editar esta clase." });
        }
        await pool.query('DELETE FROM horarios WHERE clase_id = $1', [clase_id]);

        if (horarios && horarios.length > 0) {
            for (let h of horarios) {
                await pool.query(
                    `INSERT INTO horarios (clase_id, dia_semana, hora_inicio) VALUES ($1, $2, $3)`,
                    [clase_id, h.dia || h.dia_semana, h.hora || h.hora_inicio]
                );
            }
        } else if (dia && hora) {
            await pool.query(
                `INSERT INTO horarios (clase_id, dia_semana, hora_inicio) VALUES ($1, $2, $3)`,
                [clase_id, dia, hora]
            );
        }

        res.json({ mensaje: "¡Clase actualizada con éxito con sus nuevos horarios!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar la clase." });
    }
};
const obtenerMisAlumnosGeneral = async (req, res) => {
    const tutor_id = req.usuario.id;

    try {
        const query = `
            SELECT 
                u.id AS alumno_id, 
                u.nombres, 
                u.apellido_paterno, 
                u.carrera, 
                u.correo,
                c.nombre AS clase_inscrita,
                i.fecha_inscripcion
            FROM inscripciones i
            JOIN usuarios u ON i.tutorado_id = u.id
            JOIN clases c ON i.clase_id = c.id
            WHERE c.tutor_id = $1;
        `;
        const respuesta = await pool.query(query, [tutor_id]);
        
        res.json(respuesta.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar la lista de alumnos" });
    }
};

module.exports = { crearClase, obtenerClases, obtenerMisClasesCreadas, obtenerAlumnosPorClase, eliminarClase, actualizarClase, obtenerMisAlumnosGeneral };