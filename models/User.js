const mongoose = require("mongoose");

// A user must have a username and password, and both must be strings 
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("User", userSchema);