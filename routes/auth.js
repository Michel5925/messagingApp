// HANDLES Registration, login and logout

const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const router = express.Router();

// Registration route and checks
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) 
        {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        if (password.length < 8) 
        {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        if(password.length > 100)
        {
            return res.status(400).json ({
                message: "Password cannot be more than 100 characters"
            });
        }

        const cleanUsername = username.trim();

        if(cleanUsername.length < 3)
        {
            return res.status(400).json({
                message: "Username must be at least 3 characters"
            })
        }

        if(cleanUsername.length > 30)
        {
            return res.status(400).json({
                message: "Username cannot be more than 20 characters"
            });
        }

        // const usernamePattern = /^[a-zA-Z0-9_]+$/

        // if(!usernamePattern.test(cleanUsername))
        // {
        //     return res.status(400).json({
        //         message: "Username can only contain letters, numbers and underscores"
        //     });
        // }

        const existingUser = await User.findOne({ username: cleanUsername });

        if (existingUser) 
        {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username: cleanUsername,
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
        const user = await User.findOne({ username }).select("+password"); // We need password to be true here

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