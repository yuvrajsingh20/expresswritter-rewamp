require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const chalk = require("chalk");
const { filterMessageContent } = require("./lib/chatFilter");

const app = express();

// Custom Logger
const logger = {
  info: (msg) => console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.blue('ℹ')} ${msg}`),
  success: (msg) => console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.green('✔')} ${msg}`),
  warn: (msg) => console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.yellow('⚠')} ${msg}`),
  error: (msg) => console.error(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.red('✖')} ${msg}`),
  socket: (id, msg) => console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.magenta('⚡')} ${chalk.dim(`[${id.substring(0, 6)}]`)} ${msg}`)
};

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.post('/notify', (req, res) => {
  const { userId, title, msg, icon } = req.body;
  if (io) {
    io.to(`user_${userId}`).emit('new_notification', { title, msg, icon });
  }
  res.json({ ok: true });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  logger.socket(socket.id, chalk.green("Client connected"));

  // Join Project-based Chat Room or Private User Room
  socket.on("join_chat", (data) => {
    const { projectId, role, userId } = data;
    
    // Every user joins their own private room for DMs
    if (userId) {
      socket.join(`user_${userId}`);
      logger.socket(socket.id, `User ${chalk.cyan(userId)} joined private room`);
    }

    // Admins and SubAdmins also join global monitoring
    if (role === "ADMIN" || role === "SUB_ADMIN") {
      socket.join(`eagle_eye`);
      logger.socket(socket.id, `${chalk.yellow(role)} ${userId} enabled ${chalk.bold('Eagle Eye')} mode`);
    }
    
    if (projectId) {
      socket.join(`project_${projectId}`);
      logger.socket(socket.id, `Joined project ${chalk.blue(projectId)} as ${chalk.dim(role)}`);
    }
  });

  socket.on("send_message", (data) => {
    const { projectId, content, senderId, senderRole, receiverId, chatType } = data;
    
    // Filter message
    const filterResult = filterMessageContent(content);
    
    if (filterResult.isRestricted) {
      logger.warn(`Blocked restricted content from ${senderId} in ${projectId || 'DM'}`);
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
      logger.socket(socket.id, `${chalk.magenta('DM')} ${chalk.dim(senderId)} -> ${chalk.dim(receiverId || 'ADMINS')}`);
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
      logger.socket(socket.id, `${chalk.blue('MSG')} in ${chalk.bold(projectId)}: ${chalk.italic(content.substring(0, 20))}...`);
    }
  });

  socket.on("admin_join_chat", (projectId) => {
    socket.join(`project_${projectId}`);
    logger.socket(socket.id, `${chalk.yellow('ADMIN')} hooked into project ${chalk.blue(projectId)}`);
  });

  socket.on("reassign_freelancer", (data) => {
    const { projectId } = data;
    io.to(`project_${projectId}`).emit("system_alert", {
      message: "Freelancer has been reassigned by admin.",
      type: "REASSIGNMENT"
    });
    logger.info(`Project ${chalk.blue(projectId)} freelancer reassigned`);
  });

  socket.on("admin_assigned_freelancer", (data) => {
    const { projectId, freelancerId, projectName } = data;
    io.to(`user_${freelancerId}`).emit("new_assignment", {
      projectId,
      projectName,
      message: "You got new work! A project has been assigned to you."
    });
    logger.success(`Notified freelancer ${chalk.cyan(freelancerId)} about ${chalk.bold(projectName)}`);
  });

  // Keeping project legacy join temporarily
  socket.on("join_project", (projectId) => {
    socket.join(projectId);
    logger.socket(socket.id, `Legacy join: ${projectId}`);
  });

  socket.on("status_update", (data) => {
    const { projectId, status } = data;
    io.to(`project_${projectId}`).emit("project_status_changed", data);
    logger.info(`Status updated for ${chalk.blue(projectId)}: ${chalk.bold(status)}`);
  });

  socket.on("disconnect", () => {
    logger.socket(socket.id, chalk.red("Client disconnected"));
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.clear();
  console.log(`
    ${chalk.cyan('╔══════════════════════════════════════════════════════════╗')}
    ${chalk.cyan('║')}                                                          ${chalk.cyan('║')}
    ${chalk.cyan('║')}    ${chalk.bold.white('EXPRESSWRITTER')} ${chalk.yellow('CORE SYSTEM')}                      ${chalk.cyan('║')}
    ${chalk.cyan('║')}    ${chalk.dim('v1.0.0 - Production Grade Socket Server')}         ${chalk.cyan('║')}
    ${chalk.cyan('║')}                                                          ${chalk.cyan('║')}
    ${chalk.cyan('╚══════════════════════════════════════════════════════════╝')}
  `);
  
  logger.info(`${chalk.bold('System Configuration:')}`);
  console.log(`    ${chalk.green('●')} Network:      ${chalk.white('Online')}`);
  console.log(`    ${chalk.green('●')} Environment:  ${chalk.magenta(process.env.NODE_ENV || 'development')}`);
  console.log(`    ${chalk.green('●')} Port:         ${chalk.yellow(PORT)}`);
  console.log(`    ${chalk.green('●')} PID:          ${chalk.dim(process.pid)}`);
  console.log(`    ${chalk.green('●')} Frontend:     ${chalk.dim(process.env.FRONTEND_URL || "http://localhost:3000")}`);
  console.log('');
  logger.success(`Gateway initialized and listening for connections...`);
  console.log(chalk.gray('─'.repeat(60)));
});

