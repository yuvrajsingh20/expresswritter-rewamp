const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_project", (projectId) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined project ${projectId}`);
    });

    socket.on("send_message", (data) => {
      const { projectId, chatType, message, senderId } = data;
      
      // Broadcast to the project room
      io.to(projectId).emit("receive_message", {
        ...data,
        timestamp: new Date(),
      });
      
      console.log(`Message in ${projectId} (${chatType}): ${message}`);
    });

    socket.on("status_update", (data) => {
      const { projectId, status } = data;
      io.to(projectId).emit("project_status_changed", data);
      console.log(`Status update in ${projectId}: ${status}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
