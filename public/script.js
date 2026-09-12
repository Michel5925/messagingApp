console.log("Messaging app loaded");

const adminButton = document.querySelector("#adminButton");
const adminPanel = document.querySelector("#adminPanel");
const backToChat = document.querySelector("#backToChat");

const loginScreen = document.querySelector("#loginScreen");
const registerScreen = document.querySelector("#registerScreen");

const showRegisterButton = document.querySelector("#showRegister");
const showLoginButton = document.querySelector("#showLogin");

showRegisterButton.addEventListener("click", () => {
    loginScreen.style.display = "none";
    registerScreen.style.display = "block";
});

showLoginButton.addEventListener("click", () => {
    loginScreen.style.display = "block";
    registerScreen.style.display = "none";
});

const backToUsers = document.querySelector("#backToUsers");

backToUsers.addEventListener("click", () => {
    document.querySelector("#userList").classList.remove("mobileHidden");
    document.querySelector("#chat").classList.remove("mobileChat");
})

const usersContainer = document.querySelector("#users");

let selectedUser = null;
let currentUser = null;
let messageRefreshInterval = null;

// Load the users
async function loadUsers() {
    const response = await fetch("/users");
    const users = await response.json();

    usersContainer.textContent = "";

    users.forEach(user => {
        const userButton = document.createElement("button");
        userButton.classList.add("user");

        const userInfo = document.createElement("div");
        userInfo.classList.add("userInfo");

        const username = document.createElement("div");
        username.classList.add("username");
        username.textContent = user.username;

        const preview = document.createElement("div");
        preview.classList.add("messagePreview");
        preview.textContent = user.lastMessage || "No messages yet"

        userInfo.appendChild(username);
        userInfo.appendChild(preview);
        userButton.appendChild(userInfo);

        if(user.unreadCount > 0)
        {
            const unreadBadge = document.createElement("span");
            unreadBadge.textContent = user.unreadCount;
            unreadBadge.classList.add("unreadBadge");
            userButton.appendChild(unreadBadge);
        }

        userButton.addEventListener("click", () => {
            selectUser(user);
        });

        usersContainer.appendChild(userButton);
    });
}

// Get the current user
async function loadCurrentUser() {
    const response = await fetch("/users/me");

    if(!response.ok) {
        return;
    }

    currentUser = await response.json();

    if(currentUser.isAdmin)
    {
        adminButton.style.display = "block";
    }
}

async function loadAdminUsers() {
    const response = await fetch("/users/admin");

    if(!response.ok)
    {
        alert("You do not have permission to access the admin dashboard.");
        return;
    };

    const users = await response.json();

    const tableBody = document.querySelector("#adminUserTableBody");
    tableBody.textContent = "";

    users.forEach(user => {
        const row = document.createElement("tr");

        const username = document.createElement("td");
        username.textContent = user.username;

        if(user._id.toString() === currentUser._id.toString())
        {
            row.classList.add("currentUser");
            username.textContent = `${user.username} (You)`;
        }

        const member = document.createElement("td");
        const memberBadge = document.createElement("span");
        memberBadge.textContent = user.isMember ? "Member" : "Not a Member";
        memberBadge.classList.add("statusBadge");
        memberBadge.classList.add(user.isMember ? "memberBadge" : "notMemberBadge");
        member.appendChild(memberBadge);

        const admin = document.createElement("td");
        const adminBadge = document.createElement("span");
        adminBadge.textContent = user.isAdmin ? "Admin" : "User";
        adminBadge.classList.add("statusBadge");
        adminBadge.classList.add(user.isAdmin ? "adminBadge" : "userBadge");
        admin.appendChild(adminBadge);

        const joined = document.createElement("td");
        joined.textContent = new Date(user.createdAt).toLocaleDateString();

        const actions = document.createElement("td");

        if(user._id.toString() !== currentUser._id.toString())
        {
            const memberButton = document.createElement("button");
            memberButton.classList.add("membershipButton");
            memberButton.textContent = user.isMember ? "Remove Member" : "Make Member";

            memberButton.addEventListener("click", async () => {
                const response = await fetch(`/users/${user._id}/membership`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type" : "application/json"
                        },
                        body: JSON.stringify({
                            isMember: !user.isMember
                        })
                    }
                );

                const data = await response.json();

                if(!response.ok)
                {
                    alert(data.message);
                    return;
                }

                await loadAdminUsers();
            })

            actions.appendChild(memberButton);
        }

        row.appendChild(username);
        row.appendChild(member);
        row.appendChild(admin);
        row.appendChild(joined);
        row.appendChild(actions)

        tableBody.appendChild(row);
    });
}

// Initialisation function / Automatically checks if you're already logged in
async function init() {
    const response = await fetch("/users/me");

    if(!response.ok)
    {
        return;
    }

    currentUser = await response.json();

    document.querySelector("#authSection").style.display = "none";
    document.querySelector("#app").style.display = "flex";

    if(currentUser.isAdmin)
    {
        adminButton.style.display = "block";
    }

    await loadUsers();
}

init();

// Selecting a user
async function selectUser(user) {
    selectedUser = user;

    document.querySelector("#userList").classList.add("mobileHidden");
    document.querySelector("#chat").classList.add("mobileChat");

    document.querySelector("#chatWith").textContent = user.username;

    await fetch(`/messages/read/${user._id}`, {
        method: 'PUT'
    });

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

    await loadMessages(user._id);
    await loadUsers();

    // Stop the previous refresh timer
    if(messageRefreshInterval)
    {
        clearInterval(messageRefreshInterval);
    }

    // Refresh the conversation every 3 seconds
    messageRefreshInterval = setInterval(() => {
        if(selectedUser)
        {
            loadMessages(selectedUser._id, false); // When it automatically refreshes, it doesn't constantly force the scrollbar to the bottom
        }
    }, 3000); // 3000 milliseconds = 3 seconds
}

// Load the conversation
async function loadMessages(userId, shouldScroll = true) {
    const response = await fetch(`/messages/${userId}`);

    if(!response.ok)
    {
        return;
    }

    const messages = await response.json();

    const messageContainer = document.querySelector("#messages");
    messageContainer.textContent = "";

    messages.forEach(message => {
        displayMessage(message);
    });

    // The conversation automatically opens at the bottom instead of the user having to scroll down
    if(shouldScroll)
    {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
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

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("messageButtons");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit"

        editButton.addEventListener("click", async () => {
            const newText = prompt("Edit your message:", message.text);

            if(newText === null) { return; }

            const response = await fetch(`/messages/${message._id}`,{
                method: "PUT",

                headers: {
                    "Content-Type" : "application/json"
                },

                body: JSON.stringify({
                    text: newText
                })
            });

            const data = await response.json();

            if(!response.ok)
            {
                alert(data.message);
                return;
            }

            // Updates MongoDB
            await loadMessages(selectedUser._id);
        });

        buttonContainer.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            const response = await fetch(`/messages/${message._id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if(!response.ok)
            {
                alert(data.message);
                return;
            }

            await loadMessages(selectedUser._id);
        });

        buttonContainer.appendChild(deleteButton);
        messageElement.appendChild(buttonContainer);
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

    if(!response.ok)
    {
        alert(data.message);
        return;
    }

    alert("Account created successfully! You can now log in.");

    // Switch back to login form
    registerScreen.style.display = "none";
    loginScreen.style.display = "block";

    // Clear registration form
    registrationForm.reset();

    // console.log(data);
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

// joinMembershipButton.addEventListener("click", async () => {
//     const secret = prompt("Enter the membership secret:");

//     if(!secret)
//     {
//         return;
//     }

//     const response = await fetch("/users/join", {
//         method: "POST",

//         headers: {
//             "Content-Type" : "application/json"
//         },

//         body: JSON.stringify({
//             secret
//         })
//     });

//     const data = await response.json();

//     alert(data.message);
// });

adminButton.addEventListener("click", () => {
    document.querySelector("#app").style.display = "none";
    adminPanel.style.display = "block";

    loadAdminUsers();
});

backToChat.addEventListener("click", () => {
    adminPanel.style.display = "none";
    document.querySelector("#app").style.display = "flex";
});