var express = require('express');
var http = require('http');
var app = express();
var httpServer = http.createServer(app);

var io = require('socket.io')(httpServer);

app.use(express.static('src'));

httpServer.listen(3000, function () {
    console.log("Listening on port 3000");
});


// constants

// const choices = ['apple', 'pear', 'orange', 'banana', 'watermelon', 'guava', 'kiwi', 'strawberry', 'grapes'];
//const choices = ['funny', 'lousy', 'careful', 'lazy', 'playing', 'escalator', 'weights', 'monalisa', 'bartender', 'lunar', 'looking', 'discarding'];
const choices = ['cat', 'dog', 'mouse'];


// global game variables

var item = '';

var gameStarted = false;

var players = [];
var audience = [];

var chatHistory = {};

var numClients = 0;
io.on('connection', function (clientSocket) {
    console.log('Client', numClients++, 'connected.');

    var clientObject = { id: clientSocket.id, username: 'Anonymous' + numClients, color: '#000', artThief: false};

    if (!gameStarted) {
        players.push(clientObject);
    }
    else {
        audience.push(clientObject);
    }
    
    clientSocket.emit('client connect msg', clientObject);
    if (gameStarted) {
        clientSocket.emit('load for audience', null); // replace null with game stuff
    }
    clientSocket.broadcast.emit('connect msg', clientObject.username);
    io.emit('load users', players, audience);

    /* =========== Event Listeners =========== */

    clientSocket.on('start game', function() {
        console.log('The game has started for this server.');
        gameStarted = true;
        // choose random item
        item = choices[Math.floor(Math.random() * choices.length)];
        // choose random art thief
        artThiefIndex = Math.floor(Math.random() * players.length);
        for (var i = 0; i < players.length; i++) {
            if (i == artThiefIndex) {
                players[i].artThief = true;
            }
            else {
                players[i].artThief = false;
            }
        }
        io.emit('start game on client', item, players, players[artThiefIndex].id, choices);
    });

    clientSocket.on('end game', function() {
        // todo
    })

    clientSocket.on('change username', (data) => {
        clientObject.username = data.username;
    });

    clientSocket.on('disconnect', function () {
        // numClients--;
        for (var i = 0; i < players.length; i++) {
            if (players[i].id === clientObject.id) {
                players.splice(i, 1);
            }
        }
        for (var i = 0; i < audience.length; i++) {
            if (audience[i].id === clientObject.id) {
                audience.splice(i, 1);
            }
        }
        clientSocket.broadcast.emit('disconnect msg', clientObject.username, players, audience);
    })

    clientSocket.on("chat", function (msg, source) { // When receiving a message from a client
        chatHistory[msg] = source;
        if (source == 'client') {
            clientSocket.broadcast.emit('chat msg', msg, 'server', clientObject.username); // Send message to all clients
        }
        if (source == 'info') {
            clientSocket.broadcast.emit('chat msg', msg, 'info');
        }

    })
});