const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("user connected", (username) => {
    onlineUsers.push(username);
    socket.broadcast.emit("notify user connected", username);
    io.emit("update online users", onlineUsers);

    socket.once("disconnect", () => {
      const disconnectedUserIndex = onlineUsers.indexOf(username);
      if (disconnectedUserIndex >= 0) {
        console.log(`${username} disconnected!`);
        onlineUsers.splice(disconnectedUserIndex, 1);

        socket.emit("notify user disconnected", username);
      }
    });
  });

  socket.on("new message", (data) => {
    socket.broadcast.emit("broadcast message", {
      user: data.user,
      message: data.message,
    });
  });

  socket.on("keyboard pressed", (username) => {
    socket.broadcast.emit("user typing", username);
  });

  setInterval(() => {
    socket.volatile.emit("update online users", onlineUsers);
  }, 1000);
});

server.listen(3000, () => {
  console.log(`Listening at *:3000`);
});
