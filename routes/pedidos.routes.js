const express = require("express");
const {
    crearPedidoDesdeCarrito,
    obtenerPedidoUsuario,
    obtenerPedidosEnEspera,
    obtenerPedidosEnPreparacion,
} = require("../controllers/pedidos.controller");
const {
    verificarToken,
    verificarCocinero,
} = require("../middlewares/verificarToken");
const router = express.Router();

router.post("/", verificarToken, crearPedidoDesdeCarrito);
router.get("/", verificarCocinero, obtenerPedidosEnEspera);
router.get("/preparacion", verificarCocinero, obtenerPedidosEnPreparacion);
router.get("/:id", verificarToken, obtenerPedidoUsuario);

module.exports = router;
