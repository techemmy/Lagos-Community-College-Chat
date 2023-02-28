import {socket} from "./socket.js";

// socket.onAny((event, ...args) => {
//     console.log(event, args);
//   });

let username = localStorage.getItem("username");
const addPrivateUserBtn = document.getElementById("addPrivateUserBtn");
const modalLabelContainer = document.querySelector(
  "#addPrivateUserModal .modal-body "
);

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

const emitUserConnected = (userName, messages) => {
  const item = document.createElement("li");
  item.innerHTML = `<i>${userName} just connected!</i>`;
  messages.appendChild(item);
};

const emitUserDisconnected = (userName, messages) => {
  const item = document.createElement("li");
  item.innerHTML = `<i>${userName} just disconnected!</i>`;
  messages.appendChild(item);
};

addPrivateUserBtn.addEventListener("click", () => {
  let privateUserNameInput = document.getElementById("privateUserNameInput");
  let privateUserName = privateUserNameInput.value.trim();
  const feedbackMessage = document.createElement("p");

  if (privateUserName && userExists(privateUserName)) {
    feedbackMessage.innerHTML = `<i>${privateUserName} added succesfully</i>`;
    privateUserNameInput = "";
  } else {
    feedbackMessage.innerHTML = "<i>Invalid username</i>";
  }

  modalLabelContainer.appendChild(feedbackMessage);
  setTimeout(() => (feedbackMessage.innerHTML = ""), 3000);
});

function userExists(username) {
  return true;
}

export { username, emitMessage, emitUserConnected, emitUserDisconnected };
