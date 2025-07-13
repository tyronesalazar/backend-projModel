const pool = require("../db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuarios");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getUser = async (req, res) => {
    const { id } = req.usuario;
    try {
        const result = await pool.query(
            "SELECT rol FROM usuarios WHERE id = $1",
            [id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const createUsuario = async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    const hash = await bcrypt.hash(contrasena, 10);
    try {
        const result = await pool.query(
            "INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING *",
            [nombre, correo, hash, "cliente"]
        );
        res.status(201).json({
            message: "Usuario creado.",
            correo: result.correo,
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ error: "Correo ya existe." });
        }
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const validateEmail = async (req, res) => {
    const { correo } = req.body;
    try {
        const result = await pool.query(
            "SELECT id FROM usuarios WHERE correo = $1",
            [correo]
        );
        if (result.rows.length > 0) {
            return res.status(400).json({ error: "Correo ya existe." });
        }
        res.status(200).json({ message: "Correo disponible." });
    } catch (error) {
        console.error("Error validating email:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const checkEmail = async (req, res) => {
    const { correo } = req.body;
    console.log(correo);
    try {
        const result = await pool.query(
            "SELECT id FROM usuarios WHERE correo = $1",
            [correo]
        );
        console.log(result.rows);
        if (result.rows.length > 0) {
            return res.status(200).json({ message: "Correo existe." });
        }
        res.status(400).json({ error: "Correo no existe." });
    } catch (error) {
        console.error("Error validating email:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const loginUsuario = async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const result = await pool.query(
            "SELECT * FROM usuarios WHERE correo = $1",
            [correo]
        );
        console.log(result.rows);
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ error: "Las credenciales ingresadas no son válidas" });
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res
                .status(401)
                .json({ error: "Las credenciales ingresadas no son válidas" });
        }

        const token = generateToken(user.id, user.rol);

        res.status(200).json({
            message: "Inicio de sesión exitoso",
            token,
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const updatePassword = async (req, res) => {
    const { correo, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
        const user = await pool.query(
            "SELECT id FROM usuarios WHERE correo = $1",
            [correo]
        );
        console.log(user.rows);
        if (user.rows < 1)
            return res.status(404).json({ error: "Usuario no encontrado." });

        const result = await pool.query(
            "UPDATE usuarios SET contrasena = $1 WHERE id = $2 RETURNING *",
            [hash, user.rows[0].id]
        );
        console.log(password);
        console.log(result.rows);
        res.status(201).json({ mensaje: "Cambio de contraseña exitoso" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status.json(500).json({ error: "Internal Server Error" });
    }
};

const generateToken = (id, rol) => {
    const token = jwt.sign({ id, rol }, process.env.JWT_SECRET, {
        expiresIn: "3h",
    });

    return token;
};

const getFavorites = async (req, res) => {
    const { id } = req.usuario;
    try {
        const result = await pool.query(
            `
      SELECT 
        m.id,
        m.nombre,
        m.descripcion,
        m.precio,
        m.disponible,
        m.imagen_url
      FROM favoritos f
      JOIN menu m ON f.id_menu = m.id
      WHERE f.id_usuario = $1
    `,
            [id]
        );

        if (result.rows < 1)
            return res.json({ error: "No hay platos favoritos" });
        console.log(result.rows);
        res.json(result.rows);
    } catch (error) {
        console.log("Error al obtener platos favoritos");
        console.log(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

const createFavorite = async (req, res) => {
    const { id } = req.usuario;
    const idMenu = req.params.idMenu;

    try {
        const result = await pool.query(
            "INSERT INTO favoritos (id_usuario,id_menu) VALUES ($1, $2) RETURNING *",
            [id, idMenu]
        );
        res.status(201).json({
            message: "Plato favorito añadido.",
        });
    } catch (error) {
        console.log("Error al añadir plato favorito");
        console.log(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

const deleteFavorite = async (req, res) => {
    const { id } = req.usuario;
    const idMenu = req.params.idMenu;
    try {
        const result = await pool.query(
            "DELETE FROM favoritos WHERE id_usuario = $1 AND id_menu = $2",
            [id, idMenu]
        );
        res.status(200).json({ message: "Plato favorito eliminado." });
    } catch (error) {
        console.log("Error al eliminar plato favorito");
        console.log(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

module.exports = {
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
};
