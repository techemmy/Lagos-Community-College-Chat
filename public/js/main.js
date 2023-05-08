import { socket, canUserBeAdded, addPrivateMessages } from "./socket.js";

const addPrivateUserBtn = document.getElementById("addPrivateUserBtn");
const addPrivateUserForm = document.getElementById("addPrivateUserForm");
const modalPopup = document.querySelector("#addPrivateUserModal .modal-body");
const userNameInput = document.getElementById("privateUserNameInput");
const generalChannel = document.getElementById("general");
const privateMessages = document.getElementById("privateMessages");


const username = retrieveUsername() || getUserName();

socket.auth = { username };
socket.connect();
setActiveChannel("general");

generalChannel.addEventListener("click", () => {
  setActiveChannel("general");
})

function getUserName(username, user) {
  while (user && username === user.username) {
    alert("Username is taken!");
    username = prompt("Enter another username");
  }

  while (!username || username.trim() === "") {
    username = prompt("Enter your username");
  }

  return username.trim();
}

function retrieveUsername() {
  return localStorage.getItem("username");
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
    addNotification(modalPopup, "<i>Invalid username</i>");
    userNameInput.value = "";
    return;
  }

  try {
    const user = await canUserBeAdded(socket, username);
    if (user) {
      addNotification(modalPopup, `<i>${username} confirmed. Adding up...</i>`);
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
};

addPrivateUserForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addPrivateUser();
});
addPrivateUserBtn.addEventListener("click", addPrivateUser);

const addUserToPrivateMessageUI = (user, room) => {
  const clickableUser = document.createElement("a");
  clickableUser.className = "private-message";
  const greenDot = document.createElement("span");
  greenDot.className = "fa fa-circle mr-3";
  const username = document.createElement("b");
  username.innerText = user;
  username.dataset.roomID = room;

  clickableUser.append(greenDot);
  clickableUser.append(username);

  privateMessages.appendChild(clickableUser);

  clickableUser.addEventListener("click", function () {
    const room = this.querySelector("b").dataset.roomID;
    setActiveChannel(room, user);
  });
};

const addNotification = (notificationContainer, message) => {
  const feedbackMessage = document.createElement("p");
  feedbackMessage.innerHTML = message;
  notificationContainer.appendChild(feedbackMessage);
  setTimeout(() => (feedbackMessage.innerHTML = ""), 3000);
};

const getActiveChannel = () => localStorage.getItem("activeChannel");

const removeUserFromPrivateMessages = username => {
  let userID;
  privateMessages.querySelectorAll('a').forEach(privateMessage => {
    const userInfo = privateMessage.querySelector('b');
    if (userInfo.textContent === username) {
      privateMessage.remove();
      userID = userInfo.dataset.roomID;
    }
  })

  return userID
}

function setActiveChannel(room, otherUserName) {
  localStorage.setItem("activeChannel", room);
  socket.emit("join channel room", room)

  document.querySelector("#activeChannel b").innerText = `Active: ${otherUserName ?? room}`
}

export {
  emitMessage,
  emitUserConnected,
  emitUserDisconnected,
  getActiveChannel,
  setActiveChannel,
  sortUsersByCurrentUser,
  addUserToPrivateMessageUI,
  getUserName,
  retrieveUsername,
  removeUserFromPrivateMessages
};
