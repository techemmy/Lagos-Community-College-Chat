import {
  username,
  emitMessage,
  emitUserConnected,
  emitUserDisconnected,
  sortUsersByCurrentUser,
  addUserToPrivateMessageUI
} from "./main.js";
const messagesContainer = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const statusBar = document.getElementById("status-bar");

const socket = io({ autoConnect: false });

socket.on("connect", () => {
  emitUserConnected(username, messagesContainer);
  socket.emit("user connected", username);
});

socket.on("notify user connected", (user) => {
  emitUserConnected(user, messagesContainer);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("notify user disconnected", (user) => {
  emitUserDisconnected(user, messagesContainer);
  window.scrollTo(0, document.body.scrollHeight);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    const data = { user: username, message: input.value };
    input.value = "";

    emitMessage(data, messagesContainer);
    window.scrollTo(0, document.body.scrollHeight);

    socket.emit("new message", data);
  }
});

socket.on("broadcast message", (data) => {
  emitMessage(data, messagesContainer);
  window.scrollTo(0, document.body.scrollHeight);
});

input.addEventListener("keypress", () => {
  socket.emit("keyboard pressed", username);
});

socket.on("user typing", (userTyping) => {
  statusBar.innerText = `${userTyping} is typing...`;
  setTimeout(() => {
    statusBar.innerText = "";
  }, 3000);
});

socket.on("update online users", (onlineUsers) => {
  onlineUsers = sortUsersByCurrentUser(onlineUsers, socket.id);
  const statusBarText = statusBar.innerText;
  if (statusBarText === "" || statusBarText.startsWith("Online")) {
    const usersName = onlineUsers.map((userObj) => {
      return userObj.username;
    });
    statusBar.innerText = "Online: ".concat(usersName);
  }
});

socket.on("add user", from => {
  console.log("entered", from);
  addUserToPrivateMessageUI(from);
})

function checkIfUserExists(socket, username) {
  return new Promise((resolve, reject) => {
    if (username === socket.auth.username) {
      return reject(Error("You can't add yourself"));
    }

    socket.emit("confirm user", username);
    socket.on("user confirmed", (user) => {
      if (user) {
        resolve(user);
      } else {
        reject(Error("User not found"));
      }
      reject(false);
    });
  });
}

function addPrivateMessages(otherUser) {
  addUserToPrivateMessageUI(otherUser.username);
  socket.emit("add user", {from: socket.auth.username, to: otherUser});
}

export { socket, checkIfUserExists, addPrivateMessages };
