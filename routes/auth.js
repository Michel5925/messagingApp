// HANDLES Registration, login and logout

const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const router = express.Router();

// Registration route and checks
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        res.json({
            message: "User created!" // Message appears in the console
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not create user"
        });
    }
});

// Login route and checks
router.post("/login", async (req, res) => {
    try {
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

        req.session.userId = user._id;

        res.json({ message: "Login successful" });

    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: "Login failed"
        });
    }
});

router.post("/logout", (req, res) => {
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

module.exports = router;