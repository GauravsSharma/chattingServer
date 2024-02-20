const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const app = express();

app.use(bodyParser.json());

const server = app.listen(8001, () => {
    console.log("Socket.IO server started at port 8001");
});

const io = new Server(server, {
    cors: true,
    maxHttpBufferSize: 1e8
});

io.on("connection", onConnected);

const allUsers = [];
const socketIdToUserMapping = new Map();

function onConnected(socket) {
    console.log("New connection:", socket.id);

    socket.on("new-user-joined", data => {
      allUsers.push(data);
      console.log(allUsers);
        socketIdToUserMapping.set(socket.id, data);
        io.emit("new-user-joined", allUsers);
    });

    socket.on("message", data => {
        socket.broadcast.emit("chat-message", data);
    });

    socket.on("disconnect", () => {
        const currUser = socketIdToUserMapping.get(socket.id);
        const index = allUsers.indexOf(currUser);
        if (index !== -1) {
            allUsers.splice(index, 1);
            socketIdToUserMapping.delete(socket.id);
            io.emit("new-user-joined", allUsers);
        }
    });

    socket.on("groupName", data => {
        io.emit("groupName", data);
    });

    socket.on("feedback", data => {
        socket.broadcast.emit("feedback", data);
    });
}
