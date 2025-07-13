const pool = require("../db/connection");
const { getPlatoIngredientes } = require("./plato-ingredientes.controller");

const getPlatos = async (req, res) => {
    console.log("buscando platos");
    try {
        const result = await pool.query("SELECT * FROM menu");
        res.status(200).json({ menu: result.rows });
    } catch (error) {
        console.error("Error al conseguir los platos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const createPlato = async (req, res) => {
    const { nombre, descripcion, precio, imagen_url } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO menu (nombre, descripcion, precio, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *",
            [nombre, descripcion, precio, imagen_url]
        );
        res.status(201).json({
            message: "Plato creado.",
            plato: result.rows[0],
        });
    } catch (error) {
        console.error("Error al crear el plato:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getPlato = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query("SELECT * FROM menu WHERE id = $1", [
            id,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Plato no encontrado" });
        }
        const ingredientes = await getPlatoIngredientes(id);
        res.status(200).json({
            plato: result.rows,
            ingredientes: ingredientes,
        });
    } catch (error) {
        console.error("Error al obtener el plato:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getPlatos,
    createPlato,
    getPlato,
};
