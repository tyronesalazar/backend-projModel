const pool = require("../db/connection");

const getCarrito = async (req, res) => {
    const { id } = req.usuario;
    try {
        const result = await pool.query(
            `SELECT
        c.id AS carrito_id,
        c.id_menu,
        m.nombre AS nombre_plato,
        c.cantidad,
        c.subtotal,
        json_agg(
            json_build_object(
            'ingrediente_id', i.id,
            'nombre', i.nombre,
            'tipo', i.tipo,
            'tipo_accion', ci.tipo_accion
            )
        ) FILTER (WHERE i.id IS NOT NULL) AS ingredientes
        FROM carrito c
        JOIN menu m ON c.id_menu = m.id
        LEFT JOIN carrito_ingredientes ci ON ci.id_carrito = c.id
        LEFT JOIN ingredientes i ON ci.id_ingrediente = i.id
        WHERE c.id_usuario = $1
        GROUP BY c.id, c.id_menu, m.nombre, c.cantidad, c.subtotal
        ORDER BY c.id
        `,
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function agregarAlCarrito(req, res) {
    const { id } = req.usuario;
    const {
        id_menu,
        total,
        base,
        proteina,
        extras = [],
        salsas = [],
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const carritoInsertText = `
        INSERT INTO carrito (id_usuario, id_menu, cantidad, subtotal)
        VALUES ($1, $2, 1, $3)
        RETURNING id
      `;
        const carritoRes = await client.query(carritoInsertText, [
            id,
            id_menu,
            total,
        ]);
        const id_carrito = carritoRes.rows[0].id;

        const ingredientesInsertText = `
        INSERT INTO carrito_ingredientes (id_carrito, id_ingrediente, tipo_accion)
        VALUES ($1, $2, 'agregado')
      `;

        async function getIngredienteId(nombre) {
            const res = await client.query(
                "SELECT id FROM ingredientes WHERE nombre = $1",
                [nombre]
            );
            if (res.rows.length === 0)
                throw new Error(`Ingrediente ${nombre} no encontrado`);
            return res.rows[0].id;
        }

        // Base
        const idBase = await getIngredienteId(base.nombre);
        await client.query(ingredientesInsertText, [id_carrito, idBase]);

        // Proteina
        const idProteina = await getIngredienteId(proteina.nombre);
        await client.query(ingredientesInsertText, [id_carrito, idProteina]);

        for (const extra of extras) {
            const idExtra = await getIngredienteId(extra.nombre);
            for (let i = 0; i < extra.cantidad; i++) {
                await client.query(ingredientesInsertText, [
                    id_carrito,
                    idExtra,
                ]);
            }
        }

        for (const salsa of salsas) {
            const idSalsa = await getIngredienteId(salsa.nombre);
            await client.query(ingredientesInsertText, [id_carrito, idSalsa]);
        }

        await client.query("COMMIT");

        res.status(201).json({ message: "Agregado al carrito", id_carrito });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
}

async function eliminarCarrito(req, res) {
    const { id_carrito } = req.params;

    try {
        const result = await pool.query("DELETE FROM carrito WHERE id = $1", [
            id_carrito,
        ]);

        if (result.rowCount === 0) {
            return res
                .status(404)
                .json({ message: "No se encontró el plato del carrito" });
        }

        res.status(200).json({ message: "Plato eliminado del carrito" });
    } catch (error) {
        console.error("Error al eliminar plato del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

async function obtenerTotalCarrito(req, res) {
    //   const { id } = req.usuario;
    const id = 1;
    try {
        const result = await pool.query(
            `SELECT 
         COALESCE(SUM(subtotal), 0) AS total
       FROM carrito
       WHERE id_usuario = $1`,
            [id]
        );

        const { total } = result.rows[0];

        res.status(200).json({
            total: parseFloat(total),
            // total_platos: parseInt(total_platos),
        });
    } catch (error) {
        console.error("Error al obtener total del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor 🥲" });
    }
}
module.exports = {
    getCarrito,
    agregarAlCarrito,
    eliminarCarrito,
    obtenerTotalCarrito,
};
