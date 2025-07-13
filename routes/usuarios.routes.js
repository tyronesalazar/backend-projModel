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
} = require("../controllers/usuarios.controller");
const verificarToken = require("../middlewares/verificarToken");
const router = express.Router();

router.get("/all", getUsuarios);
router.get("/", verificarToken, getUser);
router.post("/create", createUsuario);
router.post("/favorites/create", verificarToken, createFavorite);
router.post("/validate-email", validateEmail);
router.post("/check-email", checkEmail);
router.post("/login", loginUsuario);
router.post("/update-password", updatePassword);
router.get("/favorites/all", verificarToken, getFavorites);

module.exports = router;
