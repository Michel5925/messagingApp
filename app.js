require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(express.json());
// express.static() automatically serves index.html
app.use(express.static("public"));

console.log(process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log("MongoDB connection error: ", error);
});

// Form information now shows up in your terminal rather than the browser console
// app.post("/register", (req, res) => {
//     console.log(req.body);

//     res.json({
//         message: "User recieved!" // Your browser console shows this message 
//     });
// });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});