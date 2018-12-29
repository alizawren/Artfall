/* The purpose of this file is to set front-end elements when the game is not running. */
var startButton = null;

$(document).ready(function () {
    startButton = document.getElementById("start-game");
    startButton.onclick = startGameInServer;
})

/** Function: This method sets the left sidebar and middle area for the menu.
 * Pre-conditions: A game is not currently running in the server.
 */
function setMenu() {
    setLeftSidebarMenu();
    setMiddleAreaMenu();
}

/** Function: This method sets the left sidebar for the menu.
 * Pre-conditions: A game is not currently running.
 */
function setLeftSidebarMenu() {
    leftSidebar.innerHTML = '';

    var playerText = "<h4>Players</h4><div id='players'><!-- Script will add --></div><hr>";
    var audienceText = "<h4>Audience</h4><div id='audience'></div><hr>";

    $(leftSidebar).append(playerText);
    $(leftSidebar).append(audienceText);

}

/** Function: This method sets the middle area for the menu.
 * Pre-conditions: A game is not currently running.
 */
function setMiddleAreaMenu() {
    boardOverlay.style.display = 'block';
    boardOverlay.style.opacity = 1;
    var boardOverlayContent = document.getElementById("board-overlay-content");
    boardOverlayContent.style.display = 'block';
}