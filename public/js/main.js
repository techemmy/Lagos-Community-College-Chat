import { socket, checkIfUserExists } from "./socket.js";

let username = localStorage.getItem("username");
const addPrivateUserBtn = document.getElementById("addPrivateUserBtn");
const modalLabelContainer = document.querySelector(
  "#addPrivateUserModal .modal-body "
);
const userNameInput = document.getElementById("privateUserNameInput");

while (!username || username.trim() === "") {
  username = prompt("Enter your username");
  localStorage.setItem("username", username);
}

socket.auth = { username };
socket.connect();

const emitMessage = (data, messages) => {
  const item = document.createElement("li");
  item.innerHTML = `<b>${data.user}</b>: ${data.message}`;
  messages.appendChild(item);
};

const emitUserConnected = (user, messages) => {
  const item = document.createElement("li");
  const userName = user.username? user.username:user;
  item.innerHTML = `<i>${userName} just connected!</i>`;
  messages.appendChild(item);
};

const emitUserDisconnected = (user, messages) => {
  const item = document.createElement("li");
  const userName = user.username? user.username:user;
  item.innerHTML = `<i>${userName} just disconnected!</i>`;
  messages.appendChild(item);
};

addPrivateUserBtn.addEventListener("click", async () => {
  const user = userNameInput.value.trim();

  try {
    if (user && await checkIfUserExists(socket, user)) {
      addNotification(modalLabelContainer, `<i>${user} confirmed. Adding up...</i>`);
    }
  } catch (error) {
    if (error.message) {
      addNotification(modalLabelContainer, `${error.message}`);
    } else {
      addNotification(modalLabelContainer, "<i>Unable to add user</i>");
    }
  }
  userNameInput.value = "";
});

function addNotification(notificationContainer, message) {
  const feedbackMessage = document.createElement("p");
  feedbackMessage.innerHTML = message;
  notificationContainer.appendChild(feedbackMessage);
  setTimeout(() => (feedbackMessage.innerHTML = ""), 3000);
}

export { username, emitMessage, emitUserConnected, emitUserDisconnected };
