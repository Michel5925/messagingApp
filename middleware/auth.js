// Who can access this?
// requireLogin
// Is the user logged in?
// requireAdmin
// Is the user an administrator?

const User = require("../models/User");

function requireLogin(req, res, next) {
    if(!req.session.userId)
    {
        return res.status(401).json({
            message: "You must be logged in"
        });
    }
    next();
}

async function requireAdmin(req, res, next) {
    if(!req.session.userId)
    {
        return res.status(401).json({
            message: "You must be logged in"
        });
    }

    try {
        const user = await User.findById(req.session.userId);

        if(!user || !user.isAdmin)
        {
            return res.status(403).json({
                message: "Admin access required"
            });
        }
    
        next();
    } catch(error) {
        console.error(error);

        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    requireLogin,
    requireAdmin
};