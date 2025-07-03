import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { generateRoomId } from "./utils/generateRoomId.js";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Map to store users in rooms
const rooms = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("room:create", (data, cb) => {
    const roomId = generateRoomId();
    rooms.set(roomId, { users: [{ id: socket.id }] });
    socket.join(roomId);

    // Notify the user the room has been created.
    cb({ roomId });
  });

 

  socket.on("room:join", (data, cb) => {
    const { roomId } = data;

    const room = rooms.get(roomId);

    if (!room) {
      cb({ roomExists: false });
      return;
    } else {
      socket.join(roomId);
      room.users.push({ id: socket.id });
      cb({ roomExists: true });
    }

    socket.to(roomId).emit("user:joined", { id: socket.id})

    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("disconnecting", (reason) => {
    console.log(`User disconnecting: ${socket.id} (${reason})`);
    // 1. Find the one non-socket.id room this socket was in
    const leavingRoomId = [...socket.rooms].find((r) => r !== socket.id);
    if (!leavingRoomId) return;

    // 2. Pull the room object and remove the user
    const room = rooms.get(leavingRoomId);
    if (!room) return;

    room.users = room.users.filter((u) => u.id !== socket.id);

    // 3. If nobody’s left, delete the room; otherwise leave the mutated object
    if (room.users.length === 0) {
      rooms.delete(leavingRoomId);
    }

    console.log(rooms);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
