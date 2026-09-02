require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const User = require("./models/User.js");

const app = express();
const PORT = 3000;

app.use(express.json());
// express.static() automatically serves index.html
app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

console.log(process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

}).catch((error) => {
    console.log("MongoDB connection error: ", error);
});

// Registration function and checks
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ username });

    if(existingUser)
    {
        return res.status(400).json({
            message: "Username already exists"
        });
    }

    if(!username || !password)
    {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if(password.length < 6)
    {
        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }

    const user = new User({
        username: username,
        password: hashedPassword
    });

    await user.save();

    res.json({
        message: "User Created!" // Your browser console shows this message 
    });
});

function requireLogin(req, res, next) {
    if(!req.session.userID)
    {
        return res.status(401).json({
            message: "You must be logged in"
        });
    }
    next();
}

// Login function and checks
app.post("/login", async (req, res) => {
    const {username, password } = req.body;
    const user = await User.findOne({ username });

    if(!user)
    {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if(!passwordMatch)
    {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    req.session.userID = user._id;

    res.json({ message: "Login successful" });
});

app.get("/messages", requireLogin, (req, res) => {
    res.json({ message: "Here are your messages" });
});

app.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if(error)
        {
            return res.status(500).json({
                message: "Could not log out"
            });
        }

        res.json({ message: "Logged out" });
    });
});