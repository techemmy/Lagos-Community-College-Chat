import {
  emitMessage,
  emitUserConnected,
  emitUserDisconnected,
  sortUsersByCurrentUser,
  addUserToPrivateMessageUI,
  getUserName,
  retrieveUsername,
  getActiveChannel,
  removeUserFromPrivateMessages
} from "./main.js";
const messagesContainer = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const statusBar = document.getElementById("status-bar");

const socket = io({ autoConnect: false });

socket.on("user exists", ({ username, user }) => {
  socket.disconnect();
  const newUsername = getUserName(username, user);
  socket.auth = { username: newUsername };
  socket.connect();
});

socket.on("notify user connected", (user) => {
  if (user.isSelf) localStorage.setItem("username", user.username);
  emitUserConnected(user, messagesContainer);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("notify user disconnected", (user) => {
  emitUserDisconnected(user, messagesContainer);
  removeUserFromPrivateMessages(user);
  window.scrollTo(0, document.body.scrollHeight);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    const data = { user: retrieveUsername(), message: input.value };
    input.value = "";

    emitMessage(data, messagesContainer);
    window.scrollTo(0, document.body.scrollHeight);
    const room = getActiveChannel();

    socket.emit("new message", data, room);
  }
});

socket.on("broadcast message", (data) => {
  emitMessage(data, messagesContainer);
  window.scrollTo(0, document.body.scrollHeight);
});

input.addEventListener("keypress", () => {
  socket.emit("keyboard pressed");
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
    let usersNames = onlineUsers.map((userObj) => {
      return userObj.username;
    });
    usersNames = [`${usersNames[0]} (Yourself)`, ...usersNames.splice(1)]
    statusBar.innerText = "Online: ".concat(usersNames);
  }
});

socket.on("add user", (username, room) => {
   addUserToPrivateMessageUI(username, room);
});

socket.on("added successfully", (from) => {
  socket.emit("add private message", from);
});

function canUserBeAdded(socket, username) {
  return new Promise((resolve, reject) => {
    if (username === socket.auth.username) {
      return reject(Error("You can't add yourself"));
    }

    socket.emit("confirm user", username);
    socket.on("user confirmed", (user, error) => {
      if (user) {
        resolve(user);
      } else {
        console.log(error);
        reject(Error(error || "User not found"));
      }
      reject(false);
    });
  });
}

function addPrivateMessages(otherUser) {
  const currentUser = { username: socket.auth.username, id: socket.id }
  addUserToPrivateMessageUI(otherUser.username, otherUser.userID);
  socket.emit("add user", { from: currentUser, to: otherUser, room: currentUser.id });
}

export { socket, canUserBeAdded, addPrivateMessages };
