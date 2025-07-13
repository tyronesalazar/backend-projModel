const express = require("express");
const {
    agregarAlCarrito,
    getCarrito,
    eliminarCarrito,
} = require("../controllers/usuario.carrito.controller");
const verificarToken = require("../middlewares/verificarToken");
const router = express.Router();

router.post("/agregar", verificarToken, agregarAlCarrito);
router.get("/", verificarToken, getCarrito);
router.delete("/:id_carrito", verificarToken, eliminarCarrito);

module.exports = router;
