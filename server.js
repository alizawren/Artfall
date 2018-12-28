var express = require('express');
var http = require('http');
var app = express();
var httpServer = http.createServer(app);

var io = require('socket.io')(httpServer);

app.use(express.static('src'));

httpServer.listen(3000, function () {
    console.log("Listening on port 3000");
});

var gameStarted = false;

var players = [];
var audience = [];

var chatHistory = {};

var numClients = 0;
io.on('connection', function (clientSocket) {
    console.log('Client', numClients++, 'connected.');

    clientSocket.username = 'Anonymous' + numClients;

    if (!gameStarted) {
        players.push({ id: clientSocket.id, username: clientSocket.username, color: '#000' });
    }
    else {
        audience.push({ id: clientSocket.id, username: clientSocket.username, color: '#000' });
    }
    
    clientSocket.emit('client connect msg', clientSocket.username);
    clientSocket.broadcast.emit('connect msg', clientSocket.username);
    io.emit('load users', players, audience);

    /* =========== Event Listeners =========== */

    clientSocket.on('change username', (data) => {
        clientSocket.username = data.username;
    })

    clientSocket.on('disconnect', function () {
        // numClients--;
        for (var i = 0; i < players.length; i++) {
            if (players[i].id === clientSocket.id) {
                players.splice(i, 1);
            }
        }
        for (var i = 0; i < audience.length; i++) {
            if (audience[i].id === clientSocket.id) {
                audience.splice(i, 1);
            }
        }
        clientSocket.broadcast.emit('disconnect msg', clientSocket.username, players, audience);
    })

    clientSocket.on("chat", function (msg, source) { // When receiving a message from a client
        chatHistory[msg] = source;
        if (source == 'client') {
            clientSocket.broadcast.emit('chat msg', msg, 'server', clientSocket.username); // Send message to all clients
        }
        if (source == 'info') {
            clientSocket.broadcast.emit('chat msg', msg, 'info');
        }

    })
});