var express = require('express');
var http = require('http');
var app = express();
var httpServer = http.createServer(app);

var io = require('socket.io')(httpServer);

app.use(express.static('src'));

httpServer.listen(3000, function() {
    console.log("Listening on port 3000");
});

var chatHistory = {};

var numclientSockets = 0;
io.on('connection', function(clientSocket) {
    console.log('clientSocket', numclientSockets++, 'connected.');
    clientSocket.username = 'Anonymous';
    clientSocket.broadcast.emit('connect msg', clientSocket.username);

    clientSocket.on('change username', (data) => {
        clientSocket.username = data.username;
    }) 
    clientSocket.broadcast.emit('connect msg');

    // clientSocket.on('join', function(data) {
    //     console.log(data);
    //     console.log('join');
    // });

    
    // clientSocket.on('leave', function() {
    //     console.log('left')
    // })
    // clientsocket.on('typing', (data) => {

    // });

    clientSocket.on('connect', function() {
        // clientSocket.broadcast.emit('connect msg', clientSocket.username);
    })

    clientSocket.on('disconnect', function () {
        numclientSockets--;
        clientSocket.broadcast.emit('disconnect msg', clientSocket.username);
    })

    clientSocket.on("chat", function(msg, source) { // When receiving a message from a client
        chatHistory[msg] = source;
        if (source == 'client') {
            clientSocket.broadcast.emit('chat msg', msg, clientSocket.username); // Send message to all clients
        }
        if (source == 'info') {
            clientSocket.broadcast.emit('chat msg', msg, 'info');
        }
        
    })
});