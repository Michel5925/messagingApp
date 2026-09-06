require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/users.js");
const messageRoutes = require("./routes/messages.js");

const app = express();
const PORT = 3000;

app.use(express.json());
// express.static() automatically serves index.html
app.use(express.static("public"));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    // Better security
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(authRoutes);
app.use("/users", userRoutes); // Express combines /users with the routes (Example: /users/me)
app.use("/messages", messageRoutes); // Similar to previous line

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route does found"
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        message: "Something went wrong on the server"
    });
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

}).catch((error) => {
    console.error("MongoDB connection error: ", error);
});