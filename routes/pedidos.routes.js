const express = require("express");
const {
    crearPedidoDesdeCarrito,
} = require("../controllers/pedidos.controller");
const router = express.Router();

router.post("/", crearPedidoDesdeCarrito);
