var leftSidebar = null;
var startButton = null;
var boardOverlay = null;

var gameStarted = false;

function startGame() {
    gameStarted = true;
    setLeftSidebarGame();
    boardOverlay.style.display = 'none';
    newGame();
}

function addPlayer(player) {
    if (!gameStarted) {
        numPlayers++;
        players.push(player);

        var playerDiv = document.getElementById('players');

        var playerInfo = document.createElement('span');
        playerInfo.classList.add('player-info');

        // player dot
        var playerDotWrapper = document.createElement('span');
        var playerDot = document.createElement('div');
        playerDot.classList.add('player-dot');
        playerDot.style.backgroundColor = playerColors[numPlayers-1];
        playerDot.style.border = `1px solid ${playerColorOutlines[numPlayers-1]}`;
        playerDotWrapper.appendChild(playerDot);

        // player text
        var playerText = document.createElement('span');
        playerText.innerHTML = player;

        playerInfo.appendChild(playerDotWrapper);
        playerInfo.appendChild(playerText);
        playerDiv.appendChild(playerInfo);
    }
    else {
        var audienceDiv = document.getElementById('audience');

        var playerInfo = document.createElement('span');
        playerInfo.classList.add('player-info');

        // player dot
        var playerDotWrapper = document.createElement('span');
        var playerDot = document.createElement('div');
        playerDot.classList.add('player-dot');
        playerDot.style.backgroundColor = playerColors[numPlayers-1];
        playerDot.style.border = `1px solid ${playerColorOutlines[numPlayers-1]}`;
        playerDotWrapper.appendChild(playerDot);

        // player text
        var playerText = document.createElement('span');
        playerText.innerHTML = player;

        playerInfo.appendChild(playerDotWrapper);
        playerInfo.appendChild(playerText);
        audienceDiv.appendChild(playerInfo);
    }
}

$(document).ready(function () {
    leftSidebar = document.getElementById("left-sidebar");
    startButton = document.getElementById("start-game");
    boardOverlay = document.getElementById("board-overlay");
    startButton.onclick = startGame;

    setLeftSidebarMenu();
})

function setLeftSidebarGame() {
    leftSidebar.innerHTML = '';

    var turnText = "<h4>It's <span id='current-player'></span>'s turn!</h4><hr>";
    var instructionText = "<h4><span id='instruction-text'></span></h4><hr>";
    var audienceText = "<h4>Audience</h4><div id='audience'></div><hr>";
    var voteText = "<h4>Vote</h4><div class='scroll' id='choice-list'><!-- Script will add --></div><button id='submit-button'>Submit</button>";

    /* ======== PLAYERS ======== */

    var playerHeader = "<h4>Players</h4>";
    var playerDiv = document.createElement('div');
    playerDiv.id = 'players';
    for (var i = 0; i < numPlayers; i++) {
        var playerInfo = document.createElement('span');
        playerInfo.classList.add('player-info');

        // player dot
        var playerDotWrapper = document.createElement('span');
        var playerDot = document.createElement('div');
        playerDot.classList.add('player-dot');
        playerDot.style.backgroundColor = playerColors[i];
        playerDot.style.border = `1px solid ${playerColorOutlines[i]}`;
        playerDotWrapper.appendChild(playerDot);

        // player text
        var playerText = document.createElement('span');
        playerText.innerHTML = players[i];

        playerInfo.appendChild(playerDotWrapper);
        playerInfo.appendChild(playerText);
        playerDiv.appendChild(playerInfo);
    }

    $(leftSidebar).append(turnText);
    $(leftSidebar).append(instructionText);

    $(leftSidebar).append(playerHeader);
    $(leftSidebar).append(playerDiv);
    $(leftSidebar).append(document.createElement('hr'));
    
    $(leftSidebar).append(audienceText);
    $(leftSidebar).append(voteText);
}

function setLeftSidebarMenu() {
    leftSidebar.innerHTML = '';
    
    var playerText = "<h4>Players</h4><div id='players'><!-- Script will add --></div><hr>";
    var audienceText = "<h4>Audience</h4><div id='audience'></div><hr>";

    $(leftSidebar).append(playerText);
    $(leftSidebar).append(audienceText);
}