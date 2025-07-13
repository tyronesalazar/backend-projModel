const pool = require("../db/connection");

const getPlatoIngredientes = async (id) => {
    try {
        const result = await pool.query(
            `SELECT i.*
            FROM menu_ingredientes mi
            JOIN ingredientes i ON mi.id_ingrediente = i.id
            WHERE mi.id_menu = $1`,
            [id]
        );
        return result.rows;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getPlatoIngredientes,
};
