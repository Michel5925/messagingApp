const express = require("express");
const Message = require("../models/Message.js");
const User = require("../models/User.js");
const { requireLogin } = require("../middleware/auth.js");

const router = express.Router();

// Create a message
router.post("/", requireLogin, async (req, res) => {
    // console.log("Logged in user:", req.session.userId);
    // console.log("Message data:", req.body);

    try {
        const { recipient, text } = req.body;

        if(!recipient || !text)
        {
            return res.status(400).json({
                message: "Recipient and message are required"
            });
        }

        if(text.trim().length === 0)
        {
            return res.status(400).json({
                message: "Message cannot be empty"
            });
        }

        if(text.length > 2000)
        {
            return res.status(400).json({
                message: "Message is too long"
            });
        }

        const recipientUser = await User.findById(recipient);

        if(!recipientUser)
        {
            return res.status(404).json({
                message: "Recipient not found"
            });
        }

        const message = new Message({
            text: text.trim(),
            sender: req.session.userId,
            recipient
        });

        await message.save();

        res.json({ message: "Message sent" });

    } catch (error) {
        console.error(error);

        res.status(500).json({ message: "Could not send message" });
    }
});

// Get a conversation
router.get("/:userId", requireLogin, async (req, res) => {
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
        .sort({ createdAt: 1 });

        res.json(messages);
        
    } catch (error) {
        console.error(error);

        res.status(500).json({ messages: "Could not get messages" });
    }
});

module.exports = router;