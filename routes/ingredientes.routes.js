const express = require("express");
const router = express.Router();

const {
    getIngredientes,
    createIngrediente,
} = require("../controllers/ingredientes.controller");

router.get("/all", getIngredientes);
router.post("/create", createIngrediente);
