const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require('./router')
const { addUser, removeUser, getUser, getUserInRoom } = require('./users')

const PORT =  5001

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: "http://localhost:5173"
    } });


io.on('connection', (socket) => {
    socket.on('join', ({ name, room}, callback)=> {
        console.log(name, room)
       try {
        const { error, user} = addUser({id: socket.id, name, room});

        if(error) return callback(error);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}`})
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!`});
        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUserInRoom(user.room) });

       } catch (error) {
        console.error('Error in join event:', error);
        callback()
       }
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user: user.name, text: message});
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        console.log('User has left!!!');
        if(user) {
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUserInRoom(user.room)});
        }
      
    })
})
app.use(router);

server.listen(PORT, () => console.log(`Server has started on http://localhost:${PORT}`))
app.listen()
