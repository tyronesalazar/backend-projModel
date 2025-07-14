const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

const server = http.createServer(app);
const socket = require("./middlewares/socket");
const io = socket.init(server);
const { verificarTokenSocket } = require("./middlewares/verificarToken");
const { actualizarEstadoPedido } = require("./controllers/pedidos.controller");

const clientesConectados = new Map();

io.use(verificarTokenSocket);

io.on("connection", async (socket) => {
    const userId = socket.userId;
    console.log("🔗 Conexión establecida con el cliente:", userId);
    clientesConectados.set(userId, socket.id);
    console.log("lista de clientes conectados:", clientesConectados);

    socket.on("actualizar-estado-pedido-usuario", async (data) => {
        const { id, estado } = data;
        await actualizarEstadoPedido(id, estado);
        const socketId = clientesConectados.get(id);
        console.log("Socket ID:", socketId);
        if (socketId) {
            console.log("Emitiendo estado del pedido al usuario: ", id);
            io.to(socketId).emit("actualizar-estado-pedido-usuario", {
                id,
                estado,
            });
        }
    });
    socket.on("disconnect", () => {
        clientesConectados.delete(userId);
    });
});
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});
// Rutas de usuario
app.use("/api/usuarios", require("./routes/usuarios.routes"));
// Rutas de platos
app.use("/api/platos", require("./routes/platos.routes"));
// Rutas de carrito
app.use("/api/carrito", require("./routes/carrito.routes"));
// Rutas de pedidos
app.use("/api/pedidos", require("./routes/pedidos.routes"));

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
