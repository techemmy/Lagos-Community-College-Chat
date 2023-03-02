import { socket, checkIfUserExists, addPrivateMessages } from "./socket.js";

let username = localStorage.getItem("username");
const addPrivateUserBtn = document.getElementById("addPrivateUserBtn");
const modalPopup = document.querySelector(
  "#addPrivateUserModal .modal-body"
);
const userNameInput = document.getElementById("privateUserNameInput");

while (!username || username.trim() === "") {
  username = prompt("Enter your username");
  localStorage.setItem("username", username);
}

socket.auth = { username };
socket.connect();

const sortUsersByCurrentUser = (users, userID) => {
  users.forEach((user) => {
    user.self = user.userID === userID;
  });

  return users.sort((a, b) => {
    if (a.self) return -1;
    if (b.self) return 1;
    if (a.username < b.username) return -1;
    return a.username > b.username ? 1 : 0;
  });
};

const emitMessage = (data, messages) => {
  const item = document.createElement("li");
  item.innerHTML = `<b>${data.user}</b>: ${data.message}`;
  messages.appendChild(item);
};

const emitUserConnected = (user, messages) => {
  const item = document.createElement("li");
  const userName = user.username ? user.username : user;
  item.innerHTML = `<i>${userName} just connected!</i>`;
  messages.appendChild(item);
};

const emitUserDisconnected = (user, messages) => {
  const item = document.createElement("li");
  const userName = user.username ? user.username : user;
  item.innerHTML = `<i>${userName} just disconnected!</i>`;
  messages.appendChild(item);
};

addPrivateUserBtn.addEventListener("click", async () => {
  const username = userNameInput.value.trim();
  if (!username) {
    addNotification(
      modalPopup,
      "<i>Invalid username</i>"
    );
    userNameInput.value = "";
    return
  }

  try {
    const user = await checkIfUserExists(socket, username);
    if (user) {
      addNotification(
        modalPopup,
        `<i>${username} confirmed. Adding up...</i>`
      );
      addPrivateMessages(user);
    }
  } catch (error) {
    if (error.message) {
      addNotification(modalPopup, `${error.message}`);
    } else {
      addNotification(modalPopup, "<i>Unable to add user</i>");
    }
  }
  userNameInput.value = "";
});

const addUserToPrivateMessageUI = (user) => {
  const privateMessages = document.getElementById("privateMessages")

  const clickableUser = document.createElement('a');
  clickableUser.className = "private-message";
  const greenDot = document.createElement("span");
  greenDot.className = "fa fa-circle mr-3";
  const username = document.createElement("b");
  username.innerText = user;

  clickableUser.append(greenDot);
  clickableUser.append(username);

  privateMessages.appendChild(clickableUser);
}

const addNotification = (notificationContainer, message) => {
  const feedbackMessage = document.createElement("p");
  feedbackMessage.innerHTML = message;
  notificationContainer.appendChild(feedbackMessage);
  setTimeout(() => (feedbackMessage.innerHTML = ""), 3000);
};

export {
  username,
  emitMessage,
  emitUserConnected,
  emitUserDisconnected,
  sortUsersByCurrentUser,
  addUserToPrivateMessageUI
};
