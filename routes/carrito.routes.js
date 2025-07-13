const express = require("express");
const {
    agregarAlCarrito,
    getCarrito,
} = require("../controllers/usuario.carrito.controller");
const verificarToken = require("../middlewares/verificarToken");
const router = express.Router();

router.post("/agregar", verificarToken, agregarAlCarrito);
router.get("/", verificarToken, getCarrito);

module.exports = router;
