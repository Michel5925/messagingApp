console.log("Messaging app loaded");

const usersContainer = document.querySelector("#users");

let selectedUser = null;
let currentUser = null;

// Load the users
async function loadUsers() {
    const response = await fetch("/users");
    const users = await response.json();

    usersContainer.textContent = "";

    users.forEach(user => {
        const userButton = document.createElement("button");
        userButton.textContent = user.username;

        userButton.addEventListener("click", () => {
            selectUser(user);
        });

        usersContainer.appendChild(userButton);
    });
}

// Get the current user
async function loadCurrentUser() {
    const response = await fetch("/me");

    if(!response.ok) {
        return;
    }

    currentUser = await response.json();
}

async function init() {
    await loadCurrentUser();
    await loadUsers();
}

init();

// Selecting a user
function selectUser(user) {
    selectedUser = user;

    document.querySelector("#chatWith").textContent = user.username;

    loadMessages(user._id);
}

// Load the conversation
async function loadMessages(userId) {
    const response = await fetch(`/messages/${userId}`);
    const messages = await response.json();

    const messageContainer = document.querySelector("#messages");
    messageContainer.textContent = "";

    messages.forEach(message => {
        displayMessage(message);
    });
}

function displayMessage(message) {
    const messageContainer = document.querySelector("#messages");

    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if(message.sender._id === currentUser._id)
    {
        messageElement.classList.add("sent");
    }
    else
    {
        messageElement.classList.add("received");
    }

    messageElement.textContent = message.text;
    messageContainer.appendChild(messageElement);
}

const registrationForm = document.querySelector("#registration");

registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.querySelector("#name").value;
    const password = document.querySelector("#password").value;

    const response = await fetch("/register", {
        method: "POST",

        headers: {
            "Content-Type" : "application/json"
        },

        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const data = await response.json();

    console.log(data);
});

const loginForm = document.querySelector("#login");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.querySelector("#loginUsername").value;
    const password = document.querySelector("#loginPassword").value;

    const response = await fetch("/login", {
        method: "POST",

        headers: {
            "Content-Type" : "application/json"
        },

        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await response.json();

    console.log(data);
});

const messageForm = document.querySelector("#messageForm")

messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if(!selectedUser)
    {
        return;
    }

    const text = document.querySelector("#messageText").value;

    const response = await fetch("/messages", {
        method: "POST",
        
        headers: {
            "Content-Type" : "application/json"
        },

        body: JSON.stringify({
            recipient: selectedUser._id,
            text
        })
    });

    const data = await response.json();

    console.log(data);

    document.querySelector("#messageText").value = "";

    await loadMessages(selectedUser._id);
});