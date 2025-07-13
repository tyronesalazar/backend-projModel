const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    socket.on("nuevo-pedido", (data) => {
        console.log("💬 Mensaje recibido:", data);
        io.emit("nuevo-pedido", data);
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

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
