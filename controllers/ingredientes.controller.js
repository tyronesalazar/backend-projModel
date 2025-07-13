const pool = require("../db/connection");

const getIngredientes = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM ingredientes ");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error al conseguir los ingredientes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const createIngrediente = async (req, res) => {
    const { nombre, extra_costo } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO ingredientes (nombre, nombre, extra_costo) VALUES ($1, $2) RETURNING *",
            [nombre, extra_costo]
        );
        res.status(201).json({
            message: "Ingrediente creado.",
            ingrediente: result.rows[0],
        });
    } catch (error) {
        console.error("Error creando el ingrediente:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getIngredientes,
    createIngrediente,
};
