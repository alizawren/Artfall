/* The purpose of this file is to maintain server data (global game data), which is sent to every client. */

var express = require('express');
var http = require('http');
var app = express();
var httpServer = http.createServer(app);

var io = require('socket.io')(httpServer);

app.use(express.static('src'));

httpServer.listen(3000, function () {
    console.log("Listening on port 3000");
});


/* =========== Constants =========== */
// const choices = ['apple', 'pear', 'orange', 'banana', 'watermelon', 'guava', 'kiwi', 'strawberry', 'grapes'];
const choices = ['funny', 'lousy', 'careful', 'lazy', 'playing', 'escalator', 'weights', 'monalisa', 'bartender', 'lunar', 'looking', 'discarding'];
// const choices = ['cat', 'dog', 'mouse'];

const playerColors = ['#27a4dd', '#f1646c', '#fac174', '#8cdfc0', '#fd7db0'];


/* =========== Global game variables =========== */
var item = '';
var gameStarted = false;

var currentPlayerIndex = 0;
var currentPlayer = '';
var currentColor = playerColors[0];
var artThiefId = '';
var totalVotes = 0;
var votes = {};
var voteCounts = {};

var clickX = [];
var clickY = [];
var clickColor = [];
var clickDrag = [];


/* =========== Global site variables =========== */
var players = [];
var audience = [];

var chatHistory = {};

var clientNumber = 0;
io.on('connection', function (clientSocket) {

    /* =========== What happens when a client has connected. =========== */
    console.log('Client', clientNumber++, 'connected.');
    var clientObject = { id: clientSocket.id, username: 'Anonymous' + clientNumber, color: '#000', artThief: false, artist: false };
    if (!gameStarted) {
        players.push(clientObject);
    }
    else {
        audience.push(clientObject);
    }
    clientSocket.emit('client connect msg', clientObject);
    if (gameStarted) {
        clientSocket.emit('load for audience'); // replace null with game stuff
        clientSocket.emit('redraw', clickX, clickY, clickColor, clickDrag);
    }
    clientSocket.broadcast.emit('connect msg', clientObject.username);
    io.emit('load users', players, audience);


    /* =========== Event Listeners =========== */

    /* ------ Start game ------- */
    clientSocket.on('start game', function () {
        console.log('The game has started for this server.');
        gameStarted = true;
        // choose random item
        item = choices[Math.floor(Math.random() * choices.length)];
        // choose random art thief
        artThiefIndex = Math.floor(Math.random() * players.length);
        for (var i = 0; i < players.length; i++) {
            if (i == artThiefIndex) {
                players[i].artThief = true;
                artThiefId = players[i].id;
            }
            else {
                players[i].artThief = false;
            }
        }
        for (let player of players) {
            voteCounts[player.id] = 0;
        }
        currentPlayerIndex = 0;
        currentPlayer = players[currentPlayerIndex];
        currentColor = playerColors[currentPlayerIndex];
        io.emit('start game on client', item, players, players[artThiefIndex].id, choices, clientObject);
        io.emit('set artist', currentPlayerIndex, currentPlayer, currentColor);
    });

    /* ------ End game/Voting ------- */
    // clientSocket.on('end game', function () {
    //     // todo
    // });
    clientSocket.on('player voted',function(isArtThief,itemChoice){
      if(isArtThief){
        gameStarted = false;
        console.log('the art thief has submitted their vote');
        if(itemChoice == item){
          io.emit('end game on client', isArtThief,true);
          console.log('the game has ended, the art thief won');
        } else{
          io.emit('end game on client', isArtThief, false);
          console.log('the game has ended, the art thief lost');
        }
      } else{
        console.log('a non-art-thief has submitted their vote');
        votes[clientSocket.id] = itemChoice.id;
        totalVotes = 0;
        let highest = 0;
        for(let i in voteCounts){
          voteCounts[i] = 0;
        }
        for(let j in votes){
          totalVotes++;
          voteCounts[votes[j]]++;
          if(voteCounts[votes[j]] > highest){
            highest = voteCounts[votes[j]];
          }
        }
        io.emit('update votes',voteCounts);
        if(totalVotes == players.length - 1){
          let highestVoted = [];
          for(let k in voteCounts){
            if(voteCounts[votes[k]] == highest){
              highestVoted.push(voteCounts[votes[k]])
            }
          }
          if(highestVoted.length > 1){
            socket.on('tie');
          } else{
            gameStarted = false;
            players = players.concat(audience);
            audience = [];
            io.emit('load users', players, audience);
            console.log('the art thief has submitted their vote');
            if (itemChoice == item) {
                io.emit('end game on client', isArtThief, true);
                console.log('the game has ended, the art thief won');
            } else {
                io.emit('end game on client', isArtThief, false);
                console.log('the game has ended, the art thief lost');
            }
          }
        }
        else if(highest >= players.length/2){//if votes reach a certain number, end game
          let highestVoted = '';
          for(let m in voteCounts){
            if(voteCounts[votes[m]] == highest){
              highestVoted = voteCounts[votes[m]];
            }
            gameStarted = false;
            players = players.concat(audience);
            audience = [];
            io.emit('load users', players, audience);
            if (highestVoted == artThiefId) {//if the votes pick the art thief
                io.emit('end game on client', isArtThief, true);
                console.log('the game has ended, the players won');
            } else{
                io.emit('end game on client', isArtThief, false);
                console.log('the game has ended, the players lost');

            }
          }
        }
      }
    });
    /* ------ Next player's turn ------- */
    clientSocket.on('next player', function () {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        currentPlayer = players[currentPlayerIndex]
        currentColor = playerColors[currentPlayerIndex];
        io.emit('set artist', currentPlayerIndex, currentPlayer, currentColor);
    });

    /* ------ Redraw server ------- */
    clientSocket.on('redraw', function (newClickX, newClickY, newClickColor, newClickDrag) {
        clickX = newClickX;
        clickY = newClickY;
        clickColor = newClickColor;
        clickDrag = newClickDrag;
        io.emit('redraw', clickX, clickY, clickColor, clickDrag);
    });

    /* ------ Change username ------- */
    clientSocket.on('change username', (data) => {
        clientObject.username = data.username;
        io.emit('load users', players, audience);
        io.emit('update choices', players, choices);
    });


    /* ------ A client has disconnected ------- */
    clientSocket.on('disconnect', function () {
        console.log('player left');
        // if there are no players left, reset numClients to 0
        if (players.length === 0) {
            clientNumber = 0;
            chatHistory = [];
        }

        var partOfGame = false;

        for (var i = 0; i < players.length; i++) {
            if (players[i].id === clientObject.id) {
                partOfGame = true;
                players.splice(i, 1);
            }
        }
        for (var i = 0; i < audience.length; i++) {
            if (audience[i].id === clientObject.id) {
                audience.splice(i, 1);
            }
        }

        if (partOfGame) {
            players = players.concat(audience);
            audience = [];
            gameStarted = false;
        }

        clientSocket.broadcast.emit('disconnect msg', clientObject.username, partOfGame);
        io.emit('load users', players, audience);


    });

    /* ------ Chat message has been sent ------- */
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
