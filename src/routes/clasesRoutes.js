const express = require('express');
const router = express.Router();
const clasesController = require('../controllers/clasesController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/', verificarToken, clasesController.crearClase);
router.get('/', clasesController.obtenerClases);
router.get('/creadas', verificarToken, clasesController.obtenerMisClasesCreadas);
router.get('/:id/alumnos', verificarToken, clasesController.obtenerAlumnosPorClase);
router.delete('/:id', verificarToken, clasesController.eliminarClase);
router.put('/:id', verificarToken, clasesController.actualizarClase);
router.get('/mis-alumnos', verificarToken, clasesController.obtenerMisAlumnosGeneral);
router.get('/', verificarToken, clasesController.obtenerClases);

module.exports = router;