var express = require('express');
var http = require('http');
var app = express();
var httpServer = http.createServer(app);

var io = require('socket.io')(httpServer);

app.use(express.static('src'));

httpServer.listen(3000, function () {
    console.log("Listening on port 3000");
});

var chatHistory = {};

var numClients = 0;
io.on('connection', function (clientSocket) {
    console.log('Client', numClients++, 'connected.');
    clientSocket.username = 'Anonymous' + numClients;
    clientSocket.emit('client connect msg', clientSocket.username);
    clientSocket.broadcast.emit('connect msg', clientSocket.username);

    clientSocket.on('change username', (data) => {
        clientSocket.username = data.username;
    })

    clientSocket.on('disconnect', function () {
        // numClients--;
        clientSocket.broadcast.emit('disconnect msg', clientSocket.username);
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