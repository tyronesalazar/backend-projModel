const express = require("express");
const {
    crearPedidoDesdeCarrito,
} = require("../controllers/pedidos.controller");
const verificarToken = require("../middlewares/verificarToken");
const router = express.Router();

router.post("/", verificarToken, crearPedidoDesdeCarrito);
