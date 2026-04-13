const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', usuariosController.obtenerUsuarios);
router.put('/perfil', verificarToken, usuariosController.actualizarMiPerfil);

module.exports = router;