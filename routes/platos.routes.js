const express = require("express");
const router = express.Router();
const { getPlatos, createPlato } = require("../controllers/platos.controller");
const verificarToken = require("../middlewares/verificarToken");

router.get("/all", verificarToken, getPlatos);
router.post("/create", createPlato);

module.exports = router;
