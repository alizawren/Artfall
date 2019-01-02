/* The purpose of this file is to set front-end elements when the game is not running. */
var startButton = null;

/** Function: This method sets the left sidebar and middle area for the menu.
 * Pre-conditions: A game is not currently running in the server.
 */
function setMenu() {
    setLeftSidebarMenu();
    setMiddleAreaMenu();
    setUsersDiv();
}

/** Function: This method sets the left sidebar for the menu.
 * Pre-conditions: A game is not currently running.
 */
function setLeftSidebarMenu() {
    leftSidebar.innerHTML = '';

    var playerText = "<h4>Players</h4><div class='scroll' id='players'><!-- Script will add --></div><hr>";
    var audienceText = "<h4>Audience</h4><div class='scroll' id='audience'></div><hr>";

    var beAudienceMember = document.createElement('button');
    beAudienceMember.innerHTML = "Be Audience Member";
    beAudienceMember.onclick = function () {
        var roleChoice = beAudienceMember.innerHTML;
        beAudienceMember.innerHTML = (roleChoice === "Be Audience Member") ? "Be Player" : "Be Audience Member";
        toggleAudienceMember(roleChoice);
    };

    $(leftSidebar).append(playerText);
    $(leftSidebar).append(audienceText);
    $(leftSidebar).append(beAudienceMember);



}

/** Function: This method sets the middle area for the menu.
 * Pre-conditions: A game is not currently running.
 */
function setMiddleAreaMenu() {
    var boardOverlayContent = document.getElementById("board-overlay-content");
    boardOverlayContent.innerHTML = "<p>Welcome to Artfall!</p>";
    boardOverlayContent.innerHTML += "<p>In this game, everyone knows the chosen item except for one person. This person is the Art Thief, and their goal is to figure out the chosen item. Everyone else's goal is to vote for and rat out the Art Thief.</p>"
    boardOverlayContent.innerHTML += "<p>On your turn, you may draw one line on the board. Together, you and the other players will draw out the chosen item. However, if you are the Art Thief, it's your job to blend in by drawing a believable line!</p>"
    boardOverlayContent.innerHTML += "<button id='start-game'>Start Game</button>"

    boardOverlay.style.display = 'block';
    boardOverlay.style.opacity = 1;
    boardOverlayContent.style.display = 'block';

    startButton = document.getElementById("start-game");
    startButton.onclick = function () {
        if (players.length < 3) {
            createNotice(50, 0, 'You need at least 3 players to start the game.');
            return;
        }
        startGameInServer();
    };
}

function setEndGame(isArtThief, didWin, item, itemChoice, artThiefUsername) {
    var boardOverlayContent = document.getElementById("board-overlay-content");
    boardOverlayContent.innerHTML = `<h4>The ${isArtThief ? 'Art Thief ' : 'Players '}${didWin ? 'Won!' : 'Lost!'}</h4>`;
    boardOverlayContent.innerHTML += `<span>The item was <b>"${item}"</b>.</span><br>`;
    boardOverlayContent.innerHTML += `<span>The Art Thief was <b>"${artThiefUsername}"</b>.</span><br>`;
    if (isArtThief) {

        var picked = document.createElement('span');
        picked.innerHTML = `"${itemChoice}."`;
        var classToAdd = didWin ? 'win' : 'lose';
        picked.classList.add(classToAdd);

        var sentenceWithPicked = document.createElement('span');
        sentenceWithPicked.innerHTML = "The Art Thief voted for ";
        sentenceWithPicked.appendChild(picked);
        boardOverlayContent.appendChild(sentenceWithPicked);
    }
    else {
        for (var i = 0; i < players.length; i++) {
            if (players[i].id === itemChoice) {
                itemChoice = players[i].username;
                break;
            }
        }
        var picked = document.createElement('span');
        picked.innerHTML = `"${itemChoice}."`;
        var classToAdd = didWin ? 'win' : 'lose';
        picked.classList.add(classToAdd);

        var sentenceWithPicked = document.createElement('span');
        sentenceWithPicked.innerHTML = "The players voted for ";
        sentenceWithPicked.appendChild(picked);
        boardOverlayContent.appendChild(sentenceWithPicked);
    }


    boardOverlay.style.display = 'block';
    boardOverlay.style.opacity = 1;
    boardOverlayContent.style.display = 'block';
}