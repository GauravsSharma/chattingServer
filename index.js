const express = require("express");
const bodyParser = require("body-parser")
const {Server} = require("socket.io");
const { clear } = require("console");
const app = express();

const io = new Server({
    cors:true,
    maxHttpBufferSize: 1e8 
})

app.use(bodyParser.json());

io.on("connection",onConnected);

const allUsers = [];
console.log(allUsers);
const socketIdToUserMapping = new Map();
app.listen(8000,()=>{
    console.log("Server started at port 8000");
})
function onConnected(socket){
  console.log(socket.id);
  socket.on("new-user-joined",data=>{
    allUsers.push(data);
    socketIdToUserMapping.set(socket.id,data);
    io.emit("new-user-joined",allUsers);
  })
  socket.on("message",data=>{
    socket.broadcast.emit("chat-message",data);
    console.log(data);
  })
  socket.on("disconnect",()=>{
    const currUser = socketIdToUserMapping.get(socket.id);
    allUsers.pop(currUser);
    console.log(allUsers);
    io.emit("new-user-joined",allUsers);
    
  })
  socket.on("groupName",data=>{
   io.emit("groupName",data)
  })
  socket.on("feedback",data=>{
    socket.broadcast.emit("feedback",data)
  })
}
io.listen(8001);

