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

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

const onlineUsers = [];

io.on("connection", (socket) => {
  for (let [id, socket] of io.of("/").sockets) {
    const userExists = onlineUsers.find((user) => {
      return user.userID === id || user.username === socket.username;
    });

    if (!userExists) {
      onlineUsers.push({
        userID: id,
        username: socket.username,
      });
    }
  }

  socket.on("user connected", () => {
    socket.broadcast.emit("notify user connected", {
      userID: socket.id,
      username: socket.username,
    });
  });

  socket.once("disconnect", () => {
    const disconnectedUserIndex = onlineUsers.findIndex((user) => {
      return user.userID === socket.id && user.username === socket.username;
    });
    if (disconnectedUserIndex >= 0) {
      onlineUsers.splice(disconnectedUserIndex, 1);
      socket.broadcast.emit("notify user disconnected", socket.username);
    }
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

  socket.on("confirm user", (username) => {
    const userExists = onlineUsers.findIndex((user) => {
      return user.username === username;
    });
    socket.emit("user confirmed", userExists);
  });
});

app.use((err, req, res, next) => {
  console.error("AN ERROR OCCURED...");
  console.error(err.message);
});

server.listen(3000, () => {
  console.log(`Listening at *:3000`);
});

module.exports = { onlineUsers };
