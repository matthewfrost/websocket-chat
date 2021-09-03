const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('./config/passport')(passport);

const app = express();
const server = http.createServer(app);
const botName = "Admin";

const io = socketio(server);

io.on("connect", (socket) => {
    socket.on("joinRoom", ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //emits to just the user that is connecting
        socket.emit("message", formatMessage(botName, "welcome"));

        //emits to everyone in the provided room BUT the user that is connecting
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    socket.on("disconnect", () => {
        const user = getCurrentUser(socket.id);
        if(user){
            userLeave(user.id);
            //emit to everyone
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has disconnected`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, message));
    })
});

app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, "public")))
app.use(passport.initialize());
app.use(passport.session());
app.use("/users", require('./routes/users'))

const port = 3000 || process.env.port

server.listen(port, () => {
    console.log(`server running on port ${port}`);
    mongoose.connect("mongodb://admin:Password@127.0.0.1:27017/socket-chat", { useNewUrlParser: true})
})


const db = mongoose.connection;

db.on('error', (err) => {
    console.log(err);
})

db.once("open", () => {
    console.log("database open")
})