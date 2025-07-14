const jwt = require("jsonwebtoken");
require("dotenv").config();

const verificarToken = (req, res, next) => {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
        return res.status(403).json({ error: "Token no proporcionado." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token inválido." });
        }
        req.usuario = decoded;
        next();
    });
};

const verificarCocinero = (req, res, next) => {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
        return res.status(403).json({ error: "Token no proporcionado." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token inválido." });
        }
        if (decoded.rol !== "cocinero") {
            return res.status(403).json({ error: "Acceso denegado." });
        }
        req.usuario = decoded;
        next();
    });
};

const verificarTokenSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Token no proporcionado"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (error) {
        console.log("Token invalido");
        return next(new Error("Token inválido"));
    }
};

module.exports = { verificarToken, verificarCocinero, verificarTokenSocket };
