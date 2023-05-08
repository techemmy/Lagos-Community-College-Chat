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
  const privateMessages = [];

  // prevent new user from using an existing username
  const user = onlineUsers.find((user) => {
    return user.username === socket.username;
  });
  if (user && socket.id !== user.userID) {
    socket.emit("user exists", { username: socket.username, user });
    return;
  }

  // add new users to the list of online users
  for (let [id, socket] of io.of("/").sockets) {
    const isUserFound = onlineUsers.find((user) => {
      return user.userID === id || user.username === socket.username;
    });

    if (!isUserFound) {
      onlineUsers.push({
        userID: id,
        username: socket.username,
      });
    }
  }

  socket.emit("notify user connected", {
    username: socket.username,
    isSelf: true,
  });

  socket.broadcast.emit("notify user connected", {
    userID: socket.id,
    username: socket.username,
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

  socket.on("new message", (data, room) => {
    if (room !== "general") {
      data.user = `<i>DM from ${data.user}</i>`;
      socket.to(room).emit("broadcast message", data);
      return;
    }
    socket.broadcast.emit("broadcast message", data);
  });

  socket.on("keyboard pressed", () => {
    socket.broadcast.emit("user typing", socket.username);
  });

  setInterval(() => {
    socket.volatile.emit("update online users", onlineUsers);
  }, 1000);

  socket.on("confirm user", (username) => {
    let user;
    let error;

    if (privateMessages.includes(username)) {
      user = null;
      error = "User has been added!";
    } else {
      user = onlineUsers.find((user) => {
        return user.username === username;
      });
    }
    socket.emit("user confirmed", user, error);
  });

  socket.on("add user", ({ from, to, room }) => {
    privateMessages.push(to.username);
    socket.to(to.userID).emit("add user", from.username, room);
    socket.to(to.userID).emit("added successfully", from.username); // add current user to other user private messages list
  });

  socket.on("add private message", (from) => {
    privateMessages.push(from);
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
