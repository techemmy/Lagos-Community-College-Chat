import { socket, canUserBeAdded, addPrivateMessages } from "./socket.js";

let username = localStorage.getItem("username");
const addPrivateUserBtn = document.getElementById("addPrivateUserBtn");
const addPrivateUserForm = document.getElementById("addPrivateUserForm");
const modalPopup = document.querySelector(
  "#addPrivateUserModal .modal-body"
);
const userNameInput = document.getElementById("privateUserNameInput");

username = getUserName(username);

socket.auth = { username };
socket.connect();

function getUserName(username, user) {
  while (user && username === user.username) {
    alert("Username is taken!");
    username = prompt("Enter another username").trim();
  }

  while (!username || username.trim() === "") {
    username = prompt("Enter your username").trim();
  }

  return username;
}

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

const addPrivateUser = async () => {
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
    const user = await canUserBeAdded(socket, username);
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
}

addPrivateUserForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addPrivateUser();
});
addPrivateUserBtn.addEventListener("click", addPrivateUser);


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

  clickableUser.addEventListener("click", function(){
    const username = this.querySelector("b").textContent;
    setActiveChannel(username);
  })
}

const addNotification = (notificationContainer, message) => {
  const feedbackMessage = document.createElement("p");
  feedbackMessage.innerHTML = message;
  notificationContainer.appendChild(feedbackMessage);
  setTimeout(() => (feedbackMessage.innerHTML = ""), 3000);
};

const getActiveChannel = () => localStorage.getItem("activeChannel");

const setActiveChannel = (user) => localStorage.setItem("activeChannel", user)

export {
  username,
  emitMessage,
  emitUserConnected,
  emitUserDisconnected,
  getActiveChannel,
  setActiveChannel,
  sortUsersByCurrentUser,
  addUserToPrivateMessageUI,
  getUserName
};
