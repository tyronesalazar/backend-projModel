const express = require("express");
const {
    crearPedidoDesdeCarrito,
    obtenerPedidosEnEspera,
    obtenerPedidosEnPreparacion,
    obtenerPedidosListos,
} = require("../controllers/pedidos.controller");
const {
    verificarToken,
    verificarCocinero,
} = require("../middlewares/verificarToken");
const router = express.Router();

router.post("/", verificarToken, crearPedidoDesdeCarrito);
router.get("/", verificarCocinero, obtenerPedidosEnEspera);
router.get("/preparacion", verificarCocinero, obtenerPedidosEnPreparacion);
router.get("/listos", verificarCocinero, obtenerPedidosListos);

module.exports = router;
