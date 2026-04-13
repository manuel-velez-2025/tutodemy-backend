const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: "Acceso denegado. Faltan credenciales de seguridad." });
    }

    try {
        const token = authHeader.split(' ')[1];
        const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = usuarioVerificado;
        next();

    } catch (error) {
        res.status(400).json({ error: "El token no es válido o ya expiró." });
    }
};

module.exports = verificarToken;