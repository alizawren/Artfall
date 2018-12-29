var leftSidebar = null;
var startButton = null;
var boardOverlay = null;

var gameStarted = false;

$(document).ready(function () {
    leftSidebar = document.getElementById("left-sidebar");
    startButton = document.getElementById("start-game");
    boardOverlay = document.getElementById("board-overlay");
    startButton.onclick = startGameInServer;

    setLeftSidebarMenu();
})

function setUsersDiv() {
    var playerDiv = document.getElementById('players');
    playerDiv.innerHTML = '';
    for (var i = 0; i < players.length; i++) {
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
        playerText.innerHTML = players[i].username;

        //player votes
        var playerVoteCount = document.createElement('span');
        playerVoteCount.classList.add('vote-count');
        playerVoteCount.id = players[i].id+'-votecount';
        playerVoteCount.innerHTML = '';
        playerText.appendChild(playerVoteCount);

        playerInfo.appendChild(playerDotWrapper);
        playerInfo.appendChild(playerText);
        playerDiv.appendChild(playerInfo);

    }

    var audienceDiv = document.getElementById('audience');
    audienceDiv.innerHTML = '';
    for (var i = 0; i < audience.length; i++) {
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
        playerText.innerHTML = audience[i].username;

        playerInfo.appendChild(playerDotWrapper);
        playerInfo.appendChild(playerText);
        audienceDiv.appendChild(playerInfo);
    }
}

function setLeftSidebarGame() {
    leftSidebar.innerHTML = '';

    var turnText = "<h4>It's <span id='current-player'></span> turn!</h4><hr>";
    var instructionText = "<h4><span id='instruction-text'></span></h4><hr>";
    var playerText = "<h4>Players</h4><div id='players'></div><hr>";
    var audienceText = "<h4>Audience</h4><div id='audience'></div><hr>";
    var voteText = "<h4>Vote</h4><p id='vote-instructions'></p><div class='scroll inner-box' id='choice-list'><!-- Script will add --></div><button id='submit-button'>Submit</button>";

    $(leftSidebar).append(turnText);
    $(leftSidebar).append(instructionText);
    $(leftSidebar).append(playerText);
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

function setMiddleAreaMenu() {
    boardOverlay.style.display = 'block';
    boardOverlay.style.opacity = 1;
    var boardOverlayContent = document.getElementById("board-overlay-content");
    boardOverlayContent.style.display = 'block';
}
