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