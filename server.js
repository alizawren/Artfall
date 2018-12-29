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

const playerColors = ['#27a4dd', '#f1646c', '#fac174', '#8cdfc0', '#fd7db0'];

// global game variables

var item = '';
var gameStarted = false;

var currentPlayerIndex = 0;
var currentPlayer = '';
var currentColor = playerColors[0];
var artThiefId = '';
var clickX = [];
var clickY = [];
var clickColor = [];
var clickDrag = [];

var players = [];
var audience = [];

var totalVotes = 0;
var votes = {};
var voteCounts = {};
var chatHistory = {};

var numClients = 0;
io.on('connection', function (clientSocket) {
    console.log('Client', numClients++, 'connected.');

    var clientObject = { id: clientSocket.id, username: 'Anonymous' + numClients, color: '#000', artThief: false, artist: false };

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
        for(let player of players){
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
        votes[clientScoekt.id] = itemChoice.id;
        totalVotes = 0;
        let highest = 0;
        for(let i of voteCounts){
          voteCounts[i] = 0;
        }
        for(let j of votes){
          totalVotes++;
          voteCounts[votes[j]]++;
          if(voteCounts[votes[j]] > highest){
            highest = voteCounts[votes[j]];
          }
        }
        io.emit('update votes',voteCounts);
        if(totalVotes == players.length - 1){
          let highestVoted = [];
          for(let k of voteCounts){
            if(voteCounts[votes[k]] == highest){
              highestVoted.push(voteCounts[votes[k]])
            }
          }
          if(highestVoted.length > 1){
            socket.on('tie');
          } else{
            gameStarted = false;
            if(highestVoted[0] == artThiefId){//if the votes pick the art thief
              io.emit('end game on client', isArtThief, true);
              console.log('the game has ended, the players won');
            }{
              io.emit('end game on client', isArtThief, false);
              console.log('the game has ended, the players lost');

            }
          }
        }
        else if(highest >= players.length/2){//if votes reach a certain number, end game
          let highestVoted = '';
          for(let m of voteCounts){
            if(voteCounts[votes[m]] == highest){
              highestVoted = voteCounts[votes[m]];
            }
          }
          gameStarted = false;
          if(highestVoted == artThiefId){//if the votes pick the art thief
            io.emit('end game on client',isArtThief,true);
            players = players.concat(audience);
            audience = [];
            io.emit('load users',players,audience);
            console.log('the game has ended, the players won');
          }{
            io.emit('end game on client',isArtThief,false);
            console.log('the game has ended, the players lost');

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
    });


    /* ------ A client has disconnected ------- */
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

        if(gameStarted){
          gameStarted = false;
          io.emit('player disconnected');
        }
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
