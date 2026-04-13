const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horariosController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/', verificarToken, horariosController.crearHorario);

module.exports = router;