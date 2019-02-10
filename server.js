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
// const choices = ['funny', 'lousy', 'careful', 'lazy', 'playing', 'escalator', 'weights', 'monalisa', 'bartender', 'lunar', 'looking', 'discarding'];
// const choices = ["button", "computer", "shoe lace", "nail clipper", "buckle", "remote", "spring", "keys", "milk", "lip gloss", "lamp", "cat", "television", "soap", "cork", "camera", "teddies", "washing machine", "drawer"];
// const choices = ['cat', 'dog', 'mouse'];
const choices = ["Mona Lisa", "The Starry Night", "The Scream", "The Night Watch", "The Kiss", "The Arnolfini Portrait", "The Girl With a Pearl Earring", "Luncheon Of the Boating Party", "The Grand Odalisque", "The Swing", "The Liberty Leading The People", "The Birth of Venus", "Napoleon Crossing The Alps", "American Gothic", "Sunday Afternoon On the Island of Grande Le Jetta", "Primavera", "The Third Of May 1808", "The Wanderer Above The Sea Of Fog", "The Last Supper", "A Bar At The Folies Bergere", "The Storm On The Sea of Galilee", "The Lady With The Ermine", "The Grate Wave Off Kanagwa", "The Night Cafe", "Composition VIII", "A Friend In Need", "Saturn Devouring His Son", "The Lady Of Shalott", "The Anatomy Lesson of Dr. Nicolaes Tulp", "The Japanese Bridge", "Guernica", "The Creation Of Adam", "David", "Van Gogh Self Portrait ", "Impressionist Sunrise", "Campbell's Soup Can", "Number 5 1948", "One"];

const playerColors = ['#27a4dd', '#f1646c', '#fac174', '#97dec3', '#f39cc3', '#e4ef8b', '#c494e8', '#625674'];

var newGameCounter = 0;
var newGameStarter = '';

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
var players = []; // hold player objects
var audience = []; // hold audience member objects

var chatHistory = {};

var clientNumber = 0;
io.on('connection', function (clientSocket) {

    /* =========== What happens when a client has connected. =========== */
    console.log('Client', clientNumber++, 'connected.');
    // var address = clientSocket.request.connection.remoteAddress;
    console.log('\tConnection from ' + clientSocket.conn.remoteAddress);

    var clientObject = { id: clientSocket.id, username: 'Anonymous' + clientNumber, address: clientSocket.conn.remoteAddress};
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
    io.emit('update users', players, audience);

    /* ========== Start a game ========== */
    function startGame() {
        console.log('The game has started for this server.');
        gameStarted = true;

        // Shuffle player order
        players = shuffleArray(players);

        // choose random item
        item = choices[Math.floor(Math.random() * choices.length)];
        console.log('The new item is ' + item);

        // choose random art thief
        artThiefIndex = Math.floor(Math.random() * players.length);
        console.log('The new art thief index is ' + artThiefIndex);
        artThiefId = players[artThiefIndex].id;
        console.log('The new art thief ID is ' + artThiefId);

        //start vote counts at zero
        for (let player of players) { voteCounts[player.id] = 0; }
        votes = {};

        //set current player info
        currentPlayerIndex = 0;
        currentPlayer = players[currentPlayerIndex];
        currentColor = playerColors[currentPlayerIndex];
        io.emit('update users', players, audience);
        io.emit('start game on client', item, artThiefId, clientObject);
        io.emit('update choices', choices, artThiefId);
        io.emit('update artist', currentPlayerIndex, currentPlayer, currentColor);
    }

    /* ========== End the Game ==========*/
    function endGame() {
        newGameCounter = 0;
        gameStarted = false;
        players = players.concat(audience);
        audience = [];
        io.emit('update users', players, audience)
        io.emit('end game on client');

    }
    function endGameMessage(isArtThief, didWin, itemChoice) {
        var artThiefUsername = "";
        for (var i = 0; i < players.length; i++) {
            if (players[i].id === artThiefId) {
                artThiefUsername = players[i].username;
                break;
            }
        }
        io.emit('end game message', isArtThief, didWin, item, itemChoice, artThiefUsername);
    }

    /* ==== Shuffle array ==== */
    function shuffleArray(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    /* =========== Event Listeners =========== */

    /* ------ Start game ------- */
    clientSocket.on('start game', startGame);

    clientSocket.on('new game', function () {
        if (clientObject.id != newGameStarter) {
            if (newGameCounter > 0) {
                newGameCounter = 0;
                newGameStarter = '';
                startGame();
            }
            else {
                newGameCounter++;
                newGameStarter = clientObject.id;
                io.emit('new game message', clientObject.username);
            }
        }

    });

    /* ------ End game/Voting ------- */
    clientSocket.on('end game', endGame);

    clientSocket.on('player voted', function (isArtThief, itemChoice) {
        if (isArtThief) {
            endGame();
            endGameMessage(isArtThief, itemChoice === item, itemChoice);
        } else {
            votes[clientSocket.id] = itemChoice;
            let totalVotes = 0;
            highest = 0;
            //set votecounts to zero and then tally votes
            for (let i in voteCounts) { voteCounts[i] = 0; }
            for (let j in votes) {
                totalVotes++;
                voteCounts[votes[j]]++;
                if (voteCounts[votes[j]] > highest) {
                    highest = voteCounts[votes[j]];
                }
            }
            //update votecounts client side
            io.emit('update votes', voteCounts);
            //check if the game ends
            if (totalVotes == players.length - 1) {
                //see if there's a tie
                let highestVoted = [];
                for (let k in voteCounts) {
                    if (voteCounts[k] == highest) {
                        highestVoted.push(voteCounts[votes[k]])
                    }
                }
                //if multiple players have the highest vote count, let client side know
                if (highestVoted.length > 1) {
                    io.emit('tie');
                } else {
                    //otheriwse end the game
                    endGame();
                    endGameMessage(isArtThief, itemChoice == artThiefId, itemChoice);
                }
            }
            else if (highest >= players.length / 2) {//if votes reach a certain number, end game
                //see who got voted highest
                let highestVoted = '';
                for (let m in voteCounts) {
                    if (voteCounts[m] == highest) {
                        highestVoted = voteCounts[m];
                    }
                    console.log("Voted for " + highestVoted + ", art thief was " + artThiefId);
                    endGame();
                    endGameMessage(isArtThief, highestVoted === artThiefId, itemChoice);
                }
            }
        }
    });
    /* ------ Next player's turn ------- */
    clientSocket.on('next player', function () {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        currentPlayer = players[currentPlayerIndex]
        currentColor = playerColors[currentPlayerIndex];
        io.emit('update artist', currentPlayerIndex, currentPlayer, currentColor);
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
        io.emit('update users', players, audience);
        if (gameStarted) {
            io.emit('update choices', choices, artThiefId);
            io.emit('update artist', currentPlayerIndex, currentPlayer, currentColor);
        }

    });

    /* ------ Be audience member ------- */
    clientSocket.on('toggle audience member', (roleChoice) => {
        if (roleChoice === "Be Audience Member") {
            for (var i = 0; i < players.length; i++) {
                if (players[i].id === clientObject.id) {
                    players.splice(i, 1);
                    audience.push(clientObject);
                }
            }
        }
        else {
            for (var i = 0; i < audience.length; i++) {
                if (audience[i].id === clientObject.id) {
                    audience.splice(i, 1);
                    players.push(clientObject);
                }
            }
        }
        io.emit('update users', players, audience);
    })

    /* ------ A client has disconnected ------- */
    clientSocket.on('disconnect', function () {
        console.log(`Player ${clientSocket.id} has left (${clientObject.address})`);
        // if there are no players left, reset numClients to 0
        if (players.length + audience.length <= 1) { // when the last person leaves, length is at 1 for some reason
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
            endGame();
            //end game stuff
        }

        clientSocket.broadcast.emit('disconnect msg', clientObject.username, partOfGame);
        io.emit('update users', players, audience);

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
