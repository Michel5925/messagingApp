require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const User = require("./models/User.js");
const Message = require("./models/Message.js");

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

    const existingUser = await User.findOne({ username });

    if(existingUser)
    {
        return res.status(400).json({
            message: "Username already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    if(!req.session.userId)
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

    req.session.userId = user._id;

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

// Get all users
app.get("/users", requireLogin, async (req, res) => {
    try {
        const users = await User.find().select("username");

        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: "Could not get users"
        });
    }
});

// Create a message
app.post("/messages", requireLogin, async (req, res) => {
    console.log("Logged in user:", req.session.userId);
    console.log("Message data:", req.body);

    try {
        const { recipient, text } = req.body;

        if(!recipient || !text)
        {
            return res.status(400).json({
                message: "Recipient and message are required"
            });
        }

        const message = new Message({
            text,
            sender: req.session.userId,
            recipient
        });

        await message.save();

        res.json({ message: "Message sent" });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not send message"
        });
    }
});

// Get a conversation
app.get("/messages/:userId", requireLogin, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.session.userId;

        const messages = await Message.find({
            $or: [ // Find messages where either condition is true (You => Them or Them => You)
                {
                    sender: currentUserId,
                    recipient: otherUserId
                },
                {
                    sender: otherUserId,
                    recipient: currentUserId
                }
            ]
        })
        .populate("sender", "username")
        .populate("recipient", "username")
        . sort({ createdAt: 1 });

        res.json(messages);
        
    } catch (error) {
        console.error(error);

        res.status(500).json({
            messages: "Could not get messages"
        });
    }
});

app.get("/me", requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select("username");

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Could not get current user"
        });
    }
});