const express = require("express");
const User = require("../models/User.js");
const { requireLogin, requireAdmin } = require("../middleware/auth.js");

const router = express.Router();

// Get all users
router.get("/", requireLogin, async (req, res) => {
    try {
        const users = await User.find().select("username isMember");

        res.json(users);

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

        user.isMember = true;

        await user.save();

        res.json({ message: "You are now a member" });

    } catch (error) {
        console.log(error);

        res.json({ message: "Could mot join membership" });
    }
});

module.exports = router;