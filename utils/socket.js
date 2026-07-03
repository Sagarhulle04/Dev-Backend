import { Server } from "socket.io";
import crypto from "crypto";

const hashedRoomId = (userId, targetId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetId }) => {
      const roomId = hashedRoomId(userId, targetId);
      console.log("Room Joined : ", roomId);
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ firstName, userId, targetId, text }) => {
      const roomId = hashedRoomId(userId, targetId);
      console.log(firstName + " -> " + text);
      io.to(roomId).emit("messageReceived", { firstName, text });
    });

    socket.on("disconnect", () => {});
  });
};

export default initializeSocket;
