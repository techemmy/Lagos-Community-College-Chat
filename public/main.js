let socket = io();

let messagesContainer = document.getElementById("messages");
let form = document.getElementById("form");
let input = document.getElementById("input");
let statusBar = document.getElementById("status-bar");

let username = localStorage.getItem("username");
while (!username || username.trim() === "") {
  username = prompt("Enter your username");
  localStorage.setItem("username", username);
}

socket.on("connect", () => {
  emitUserConnected(username, messagesContainer);
  window.scrollTo(0, document.body.scrollHeight);
  socket.emit("user connected", username);
});

socket.on("notify user connected", (username) => {
  emitUserConnected(username, messagesContainer);
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

const emitMessage = (data, messages) => {
  const item = document.createElement("li");
  item.innerHTML = `<b>${data.user}</b>: ${data.message}`;
  messages.appendChild(item);
};

const emitUserConnected = (userName, messages) => {
  const item = document.createElement("li");
  item.innerHTML = `<i>${userName} just connected</i>`;
  messages.appendChild(item);
};
