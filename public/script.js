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
        userButton.classList.add("user");
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

// Initialisation function / Automatically checks if you're already logged in
async function init() {
    const response = await fetch("/me");

    if(response.ok)
    {
        currentUser = await response.json();

        document.querySelector("#authSection").style.display = "none";
        document.querySelector("#app").style.display = "flex";
    
        await loadUsers();
    }
}

init();

// Selecting a user
function selectUser(user) {
    selectedUser = user;

    document.querySelector("#chatWith").textContent = user.username;

    // Highlight the person you are talking to
    document.querySelectorAll(".user").forEach(button => {
        button.classList.remove("active");
    });

    document.querySelectorAll(".user").forEach(button => {
        if(button.textContent === user.username)
        {
            button.classList.add("active")
        }
    });

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

    // The conversation automatically opens at the bottom instead of the user having to scroll down
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function displayMessage(message) {
    const messageContainer = document.querySelector("#messages");

    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageContainer.appendChild(messageElement);

    const messageText = document.createElement("div");
    messageText.textContent = message.text;

    const timestamp = document.createElement("small");

    timestamp.textContent =
        new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    messageElement.appendChild(messageText);
    messageElement.appendChild(timestamp);

    if(message.sender._id === currentUser._id)
    {
        messageElement.classList.add("sent");
    }
    else
    {
        messageElement.classList.add("received");
    }
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

    if(!response.ok)
    {
        console.error(data.message);
        return;
    }

    document.querySelector("#authSection").style.display = "none";
    document.querySelector("#app").style.display = "flex";

    await loadCurrentUser();
    await loadUsers();
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

const logoutButton = document.querySelector("#logout");

logoutButton.addEventListener("click", async () => {
    await fetch("/logout", {
        method: "POST"
    });

    location.reload();
});

const joinMembershipButton = document.querySelector("#joinMembership");

joinMembershipButton.addEventListener("click", async () => {
    const secret = prompt("Enter the membership secret:");

    if(!secret)
    {
        return;
    }

    const response = await fetch("/join", {
        method: "POST",

        headers: {
            "Content-Type" : "application/json"
        },

        body: JSON.stringify({
            secret
        })
    });

    const data = await response.json();

    alert(data.message);
})