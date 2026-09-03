console.log("Messaging app loaded");

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

    const recipient = document.querySelector("#recipient").value;
    const text = document.querySelector("#messageText").value;

    const response = await fetch("/messages", {
        method: "POST",
        
        headers: {
            "Content-Type" : "application/json"
        },

        body: JSON.stringify({
            recipient,
            text
        })
    });

    const data = await response.json();

    console.log(data);
});