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


// constants

// const choices = ['apple', 'pear', 'orange', 'banana', 'watermelon', 'guava', 'kiwi', 'strawberry', 'grapes'];
const choices = ['funny', 'lousy', 'careful', 'lazy', 'playing', 'escalator', 'weights', 'monalisa', 'bartender', 'lunar', 'looking', 'discarding'];
// const choices = ['cat', 'dog', 'mouse'];

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
    /* ========== End the Game ==========*/
    function endGame(isArtThief,didWin){
      gameStarted = false;
      players = players.concat(audience);
      audience = [];
      io.load('load users',players, audience)
      //io.emit clear canvas pixel data for new game
      io.emit('end game on client', isArtThief,didWin);
    }
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

    clientSocket.on('player voted',function(isArtThief,itemChoice){
      if(isArtThief){
        endGame(isArtThief,itemChoice == item);
      } else{
        votes[clientSocket.id] = itemChoice.id;
        let totalVotes = 0;
            highest = 0;
        //set votecounts to zero and then tally votes
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
        //update votecounts client side
        io.emit('update votes',voteCounts);
        //check if the game ends
        if(totalVotes == players.length - 1){
          //see if there's a tie
          let highestVoted = [];
          for(let k in voteCounts){
            if(voteCounts[votes[k]] == highest){
              highestVoted.push(voteCounts[votes[k]])
            }
          }
          //if multiple players have the highest vote count, let client side know
          if(highestVoted.length > 1){
            io.emit('tie');
          } else{
            //otheriwse end the game
            endGame(isArtThief,itemChoice == item);
          }
        }
        else if(highest >= players.length/2){//if votes reach a certain number, end game
          //see who got voted highest
          let highestVoted = '';
          for(let m in voteCounts){
            if(voteCounts[votes[m]] == highest){
              highestVoted = voteCounts[votes[m]];
            }
            endGame(isArtThief,highestVoted == artThiefId);
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
            numClients = 0;
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
