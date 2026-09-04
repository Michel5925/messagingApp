const mongoose = require("mongoose");

// A user must have a username and password, and both must be strings 
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Tells the database (MongoDB) a username must be unique
    },

    password: {
        type: String,
        required: true
    },

    isMember: {
        type: Boolean,
        default: false
    },

    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Automatically gives user createdAt and updatedAt functions
});

module.exports = mongoose.model("User", userSchema);