const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require('./router')

const PORT =  5001

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: "http://localhost:5173"
    } });


io.on('connection', (socket) => {
    console.log('We have a new connection!!!');

    socket.on('diconnect', () => {
        console.log('User has left!!!')
    })
})

server.listen(PORT, () => console.log(`Server has started on http://localhost:${PORT}`))
app.use(router);
app.listen()
