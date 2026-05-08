const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { filterMessageContent } = require("./lib/chatFilter");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join Project-based Chat Room or Private User Room
  socket.on("join_chat", (data) => {
    const { projectId, role, userId } = data;
    
    // Every user joins their own private room for DMs
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their private room user_${userId}`);
    }

    // Admins and SubAdmins also join global monitoring
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
    const { projectId, content, senderId, senderRole, receiverId, chatType } = data;
    
    // Filter message
    const filterResult = filterMessageContent(content);
    
    if (filterResult.isRestricted) {
      socket.emit("error_alert", {
        message: "Your message contains restricted content (links/phone/email) and was blocked.",
        reasons: filterResult.reasons
      });
      
      io.to("eagle_eye").emit("flagged_message", {
        projectId,
        content,
        senderId,
        senderRole,
        timestamp: new Date(),
        reasons: filterResult.reasons
      });
      return;
    }
    
    // If it's a private DM (like Admin Chat)
    if (chatType === 'ADMIN_CHAT') {
      if (receiverId) {
        // Send to specific receiver
        io.to(`user_${receiverId}`).emit("receive_message", {
          ...data,
          timestamp: new Date(),
        });
      } else {
        // Broadcast to all admins
        io.to("eagle_eye").emit("receive_message", {
          ...data,
          timestamp: new Date(),
        });
      }
      
      // Also ensure sender sees it if they have multiple tabs
      io.to(`user_${senderId}`).emit("receive_message", {
        ...data,
        timestamp: new Date(),
      });
      console.log(`ADMIN_CHAT from ${senderId} to ${receiverId || 'ALL_ADMINS'}`);
      return;
    }

    // Broadcast to the project chat room
    if (projectId) {
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
    }
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

  socket.on("admin_assigned_freelancer", (data) => {
    const { projectId, freelancerId, projectName } = data;
    // Notify the specific freelancer
    io.to(`user_${freelancerId}`).emit("new_assignment", {
      projectId,
      projectName,
      message: "You got new work! A project has been assigned to you."
    });
    console.log(`Notified freelancer ${freelancerId} about project ${projectId}`);
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

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
