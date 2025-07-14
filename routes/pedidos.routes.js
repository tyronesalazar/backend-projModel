const express = require("express");
const {
    crearPedidoDesdeCarrito,
    obtenerPedidos,
} = require("../controllers/pedidos.controller");
const verificarToken = require("../middlewares/verificarToken");
const router = express.Router();

router.post("/", verificarToken, crearPedidoDesdeCarrito);
router.get("/", verificarToken, obtenerPedidos);

module.exports = router;
