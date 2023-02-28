import { username, emitMessage, emitUserConnected, emitUserDisconnected } from './main.js';
const messagesContainer = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const statusBar = document.getElementById("status-bar");

const socket = io({ autoConnect: true });

socket.on("connect", () => {
  emitUserConnected(username, messagesContainer);
  socket.emit("user connected", username);
});

socket.on("notify user connected", (username) => {
  window.scrollTo(0, document.body.scrollHeight);
  emitUserConnected(username, messagesContainer);
});

socket.on("notify user disconnected", (username) => {
  window.scrollTo(0, document.body.scrollHeight);
  emitUserDisconnected(username, messagesContainer);
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
    const statusBarText = statusBar.innerText;

    if (statusBarText === "" || statusBarText.startsWith("Online")) {
        statusBar.innerText = "Online: ".concat(onlineUsers);
    }
});


export { socket };
