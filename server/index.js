const express = require("express");
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const userRoutes = require('./Routes/userRoutes')
const chatRoutes = require("./Routes/chatRoutes")
const messageRoutes = require("./Routes/messageRoutes")
const { Server, Socket } = require("socket.io");

const cors = require("cors");

const app = express();
app.use(
    cors({
        origin: "*",
    })
);
dotenv.config();

app.use(express.json());

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log("Server is Connected to DB");
    }
    catch (err) {
        console.log("Server is not Connected to DB", err.message);
    }
}

connectDb();

app.get("/", (req, res) => {
    res.send("hi");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

const port = process.env.PORT || 5000;
const server = app.listen(port, console.log("Server is running..."));

const io = require("socket.io")(server, {
    cors: {
        origin: "*"
    },
    pingTimeout: 60000,
});

io.on("connection", (socket) => {
    socket.on("setup", (user) => {
        socket.join(user.data._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
    });

    socket.on("new message", (newMessageStatus) => {
        var chat = newMessageStatus.chat;
        if (!chat.users) {
            return console.log("chat.users not defined");
        }
        chat.users.forEach((user) => {
            if (user._id == newMessageStatus.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });
});
