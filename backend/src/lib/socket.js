import express from "express"
import http from "http"
import { Server } from "socket.io"

const app = express()
const server = http.createServer(app)

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server,  { cors: { origin: [ allowedOrigin ] } })


function getReceiverSocketId(userId){
  return userSocketMap[userId];
}

//online user map = {userId: socketId}
const userSocketMap = {};



//when a user connects, add them to the online user map and emit the updated list of online users to all connected clients
io.on("connection", (socket)=>{
  const userId = socket.handshake.query.userId;

  if(userId){
    userSocketMap[userId] = socket.id;
  }

  //io.emit() sends event to all connected clients - broadcast
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //if user disconnects, remove them from the online user map
  socket.on("disconnect", () =>{
    if(userId){
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  })
})

export { app, server, io, getReceiverSocketId }