const express = require("express");
const User = require("../models/User.js");
const Message = require("../models/Message.js");
const { requireLogin, requireAdmin } = require("../middleware/auth.js");

const router = express.Router();

// Get all users
router.get("/", requireLogin, async (req, res) => {
    try {
        const users = await User.find().select("username isMember");

        const usersWithInfo = await Promise.all(users.map(async user => {
            const unreadCount = await Message.countDocuments({
                sender: user._id,
                recipient: req.session.userId,
                read: false
            });

            const lastMessage = await Message.findOne({ // Looks for a message between you and this particular user
                $or: [ // Goes both ways
                    {
                        sender: req.session.userId,
                        recipient: user._id
                    },
                    {
                        sender: user._id,
                        recipient: req.session.userId
                    }
                ]
            }).sort({ createdAt: -1 }); // Give me the newest message first

            return {
                ...user.toObject(),
                unreadCount,
                lastMessage: lastMessage ? lastMessage.text : null,
                lastMessageTime: lastMessage ? lastMessage.createdAt : null
            };
        }));

        res.json(usersWithInfo);

    } catch (error) {
        console.error(error);

        res.status(500).json({ message: "Could not get users" });
    }
});

router.get("/me", requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select("username isMember isAdmin");

        res.json(user);

    } catch (error) {
        console.error(error);

        res.status(500).json({ message: "Could not get current user" });
    }
});

router.get("/admin", requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select("username isMember isAdmin createdAt");

        res.json(users);

    } catch (error) {
        console.error(error);

        res.status(500).json({ message: "Could not get users"});
    }
});

// Become a member
router.post("/join", requireLogin, async (req, res) => {
    try {
        const { secret } = req.body;

        if(secret !== process.env.MEMBERSHIP_SECRET)
        {
            return res.status(403).json({
                message: "Incorrect membership secret"
            });
        }

        const user = await User.findById(req.session.userId);

        if(!user)
        {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if(user.isMember)
        {
            return res.status(400).json({
                message: "You are already a member"
            });
        }

        user.isMember = true;

        await user.save();

        res.json({ message: "You are now a member" });

    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "Could mot join membership" });
    }
});

router.put("/:userId/membership", requireAdmin, async (req, res) => {
    try {
        const { isMember } = req.body;

        if(typeof isMember !== "boolean")
        {
            return res.status(400).json({
                message: "isMember must be true or false"
            });
        }

        const user = await User.findById(req.params.userId);

        if(!User)
        {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.isMember = isMember;

        await user.save();

        res.json({ message: "Membership Updated" });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not update membership"
        });
    }
});

module.exports = router;