const express = require('express');
const router = express.Router();
const inscripcionesController = require('../controllers/inscripcionesController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/', verificarToken, inscripcionesController.inscribirClase);
router.get('/mis-clases', verificarToken, inscripcionesController.obtenerMisClasesInscritas);

module.exports = router;