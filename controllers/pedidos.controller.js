const pool = require("../db/connection");

async function crearPedidoDesdeCarrito(req, res) {
    const { id } = req.usuario;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const carritoRes = await client.query(
            `SELECT * FROM carrito WHERE id_usuario = $1`,
            [id]
        );

        const carritoItems = carritoRes.rows;

        if (carritoItems.length === 0) {
            return res.status(400).json({ message: "El carrito está vacío 🫠" });
        }

        const totalPedido = carritoItems.reduce(
            (acc, item) => acc + parseFloat(item.subtotal),
            0
        );

        const pedidoRes = await client.query(
            `INSERT INTO pedidos (id_usuario, estado, total)
         VALUES ($1, 'pendiente', $2)
         RETURNING id`,
            [id, totalPedido]
        );
        const id_pedido = pedidoRes.rows[0].id;

        for (const item of carritoItems) {
            const detalleRes = await client.query(
                `INSERT INTO detalle_pedido (id_pedido, id_menu, cantidad, subtotal)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
                [id_pedido, item.id_menu, item.cantidad, item.subtotal]
            );
            const id_detalle_pedido = detalleRes.rows[0].id;

            const ingredientesRes = await client.query(
                `SELECT id_ingrediente, tipo_accion
           FROM carrito_ingredientes
           WHERE id_carrito = $1`,
                [item.id]
            );

            const ingredientes = ingredientesRes.rows;

            for (const ing of ingredientes) {
                await client.query(
                    `INSERT INTO detalle_ingredientes_pedido (id_detalle_pedido, id_ingrediente, tipo_accion)
             VALUES ($1, $2, $3)`,
                    [id_detalle_pedido, ing.id_ingrediente, ing.tipo_accion]
                );
            }
        }

        await client.query(`DELETE FROM carrito WHERE id_usuario = $1`, [id]);

        await client.query("COMMIT");

        res.status(201).json({
            message: "Pedido creado con éxito",
            id_pedido,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al crear pedido desde carrito:", error);
        res.status(500).json({ error: "No se pudo procesar el pedido" });
    } finally {
        client.release();
    }
}

async function obtenerPedidos(req, res) {
    try {
        const pedidosRes = await pool.query(
            `
        SELECT 
        p.id AS id_pedido,
        p.id_usuario,
        p.estado,
        p.fecha,
        p.total,
        json_agg(
            json_build_object(
            'id_menu', dp.id_menu,
            'nombre_menu', m.nombre,
            'cantidad', dp.cantidad,
            'subtotal', dp.subtotal,
            'ingredientes', (
                SELECT json_agg(
                json_build_object(
                    'id', i.id,
                    'nombre', i.nombre,
                    'tipo', i.tipo,
                    'tipo_accion', dip.tipo_accion
                )
                )
                FROM detalle_ingredientes_pedido dip
                JOIN ingredientes i ON dip.id_ingrediente = i.id
                WHERE dip.id_detalle_pedido = dp.id
            )
            )
        ) AS platos
        FROM pedidos p
        JOIN detalle_pedido dp ON dp.id_pedido = p.id
        JOIN menu m ON dp.id_menu = m.id
        GROUP BY p.id, p.id_usuario, p.estado, p.fecha, p.total
        ORDER BY p.fecha DESC
        `
        );
        res.json(pedidosRes.rows);
    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        res.status(500).json({ error: "No se pudo obtener los pedidos" });
    }
}

async function obtenerPedidoUsuario(req, res) {
    const { id } = req.usuario;
    try {
        const pedidoRes = await pool.query(
            `SELECT 
            p.id AS id_pedido,
            p.id_usuario,
            p.estado,
            p.fecha,
            p.total,
            json_agg(
                json_build_object(
                'id_menu', dp.id_menu,
                'nombre_menu', m.nombre,
                'cantidad', dp.cantidad,
                'subtotal', dp.subtotal,
                'ingredientes', (
                    SELECT json_agg(
                    json_build_object(
                        'id', i.id,
                        'nombre', i.nombre,
                        'tipo', i.tipo,
                        'tipo_accion', dip.tipo_accion
                    )
                    )
                    FROM detalle_ingredientes_pedido dip
                    JOIN ingredientes i ON dip.id_ingrediente = i.id
                    WHERE dip.id_detalle_pedido = dp.id
                )
                )
            ) AS platos
            FROM pedidos p
            JOIN detalle_pedido dp ON dp.id_pedido = p.id
            JOIN menu m ON dp.id_menu = m.id
            WHERE p.id = $1
            GROUP BY p.id, p.id_usuario, p.estado, p.fecha, p.total
            `,
            [id]
        );
        res.json(pedidoRes.rows);
    } catch (error) {
        console.error("Error al obtener pedido usuario:", error);
        res.status(500).json({ error: "No se pudo obtener el pedido" });
    }
}

module.exports = {
    crearPedidoDesdeCarrito,
    obtenerPedidos,
    obtenerPedidoUsuario,
};
