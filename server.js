const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { filterMessageContent } = require("./lib/chatFilter");

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

    // Join Project-based Chat Room
    socket.on("join_chat", (data) => {
      const { projectId, role, userId } = data;
      // Admins and SubAdmins can also join specific chats or the global eagle_eye room
      if (role === "ADMIN" || role === "SUB_ADMIN") {
        socket.join(`eagle_eye`);
        console.log(`Admin/SubAdmin ${userId} joined eagle_eye`);
      }
      
      if (projectId) {
        socket.join(`project_${projectId}`);
        console.log(`Socket ${socket.id} (${role}) joined chat for project ${projectId}`);
      }
    });

    socket.on("send_message", (data) => {
      const { projectId, content, senderId, senderRole } = data;
      
      // Filter message
      const filterResult = filterMessageContent(content);
      
      if (filterResult.isRestricted) {
        // Notify the sender
        socket.emit("error_alert", {
          message: "Your message contains restricted content (links/phone/email) and was blocked.",
          reasons: filterResult.reasons
        });
        
        // Notify Eagle Eye admins
        io.to("eagle_eye").emit("flagged_message", {
          projectId,
          content,
          senderId,
          senderRole,
          timestamp: new Date(),
          reasons: filterResult.reasons
        });
        console.log(`Blocked message in project_${projectId} from ${senderId}: ${content}`);
        return;
      }
      
      // Broadcast to the project chat room
      io.to(`project_${projectId}`).emit("receive_message", {
        ...data,
        timestamp: new Date(),
      });
      
      // Also broadcast to eagle_eye so admins can monitor live
      io.to("eagle_eye").emit("monitor_message", {
        projectId,
        ...data,
        timestamp: new Date(),
      });
      
      console.log(`Message in project_${projectId}: ${content}`);
    });

    socket.on("admin_join_chat", (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`Eagle eye socket ${socket.id} joined project_${projectId}`);
    });

    socket.on("reassign_freelancer", (data) => {
      const { projectId, oldFreelancerId, newFreelancerId } = data;
      io.to(`project_${projectId}`).emit("system_alert", {
        message: "Freelancer has been reassigned by admin.",
        type: "REASSIGNMENT"
      });
    });

    // Keeping project legacy join temporarily
    socket.on("join_project", (projectId) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined project ${projectId}`);
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
