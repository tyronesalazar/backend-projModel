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

module.exports = verificarToken;
