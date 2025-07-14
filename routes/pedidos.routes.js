const express = require("express");
const {
    crearPedidoDesdeCarrito,
    obtenerPedidos,
    obtenerPedidoUsuario,
} = require("../controllers/pedidos.controller");
const {
    verificarToken,
    verificarCocinero,
} = require("../middlewares/verificarToken");
const router = express.Router();

router.post("/", verificarToken, crearPedidoDesdeCarrito);
router.get("/", verificarCocinero, obtenerPedidos);
router.get("/:id", verificarToken, obtenerPedidoUsuario);

module.exports = router;
