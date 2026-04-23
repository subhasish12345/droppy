require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth.routes");
const boardRoutes = require("./routes/board.routes");
const listRoutes = require("./routes/list.routes");
const taskRoutes = require("./routes/task.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/lists", listRoutes);
app.use("/tasks", taskRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global err:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const boardUsers = {};

// Real-Time Socket Engine
io.on("connection", (socket) => {
  socket.on("join-board", (boardId) => {
    socket.join(boardId);

    if (!boardUsers[boardId]) boardUsers[boardId] = [];
    // Prevent duplicate entries for the same socket (e.g. React Strict Mode double mounting)
    if (!boardUsers[boardId].includes(socket.id)) {
      boardUsers[boardId].push(socket.id);
    }

    io.to(boardId).emit("presence:update", boardUsers[boardId].length);
  });

  socket.on("task:move", (data) => {
    socket.to(data.boardId).emit("task:moved", data);
  });

  socket.on("task:add", (data) => {
    socket.to(data.boardId).emit("task:added", data.task);
  });

  socket.on("task:update", (data) => {
    socket.to(data.boardId).emit("task:updated", data);
  });

  socket.on("task:delete", (data) => {
    socket.to(data.boardId).emit("task:deleted", data);
  });

  socket.on("list:add", (data) => {
    socket.to(data.boardId).emit("list:added", data.list);
  });

  socket.on("list:rename", (data) => {
    socket.to(data.boardId).emit("list:renamed", data);
  });

  socket.on("list:delete", (data) => {
    socket.to(data.boardId).emit("list:deleted", data);
  });

  socket.on("disconnect", () => {
    for (const boardId in boardUsers) {
      const index = boardUsers[boardId].indexOf(socket.id);
      if (index !== -1) {
        boardUsers[boardId].splice(index, 1);
        io.to(boardId).emit("presence:update", boardUsers[boardId].length);
      }
    }
  });
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
