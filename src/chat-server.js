const express = require('express');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let userCount = 1;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A User is connected');

    const username = 'user' + userCount++;
    socket.emit('set username', username);
    console.log(username);

    socket.on('chat message', (msg) => {
        io.emit('chat message', {username, msg});
    });

    socket.on('disconnect', () => {
        console.log('user disconnected')
    });
});

server.listen(3000, () => {
    console.log('Server is running');
});

