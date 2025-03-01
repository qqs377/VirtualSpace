const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};
const MAX_PLAYERS = 7;

io.on('connection', (socket) => {
    console.log('A user connected');

    if (Object.keys(players).length >= MAX_PLAYERS) {
        socket.emit('maxPlayersReached');
        socket.disconnect();
        return;
    }

    socket.on('newPlayer', (name) => {
        players[socket.id] = { name: name, x: Math.random() * 500, y: Math.random() * 500 };
        io.emit('updatePlayers', players);  // Notify all players about the new player
    });

    socket.on('message', (message) => {
        // Broadcast message to all players
        io.emit('chatMessage', { name: players[socket.id]?.name, message });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players);  // Notify all players that a player left
    });
});

app.get('/', (req, res) => {
    res.send('Game server is running');
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running');
});
