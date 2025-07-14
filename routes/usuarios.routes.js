const express = require("express");
const {
    getUsuarios,
    createUsuario,
    validateEmail,
    loginUsuario,
    updatePassword,
    checkEmail,
    getFavorites,
    createFavorite,
    getUser,
    deleteFavorite,
} = require("../controllers/usuarios.controller");
const { verificarToken } = require("../middlewares/verificarToken");
const { obtenerPedidoUsuario } = require("../controllers/pedidos.controller");
const router = express.Router();

router.get("/all", getUsuarios);
router.get("/", verificarToken, getUser);
router.post("/create", createUsuario);
router.post("/favorites/create/:idMenu", verificarToken, createFavorite);
router.delete("/favorites/delete/:idMenu", verificarToken, deleteFavorite);
router.post("/validate-email", validateEmail);
router.post("/check-email", checkEmail);
router.post("/login", loginUsuario);
router.post("/update-password", updatePassword);
router.get("/favorites/all", verificarToken, getFavorites);
router.get("/pedidos/all", verificarToken, obtenerPedidoUsuario);

module.exports = router;
