/* The purpose of this file is to set the front-end elements while the game is running. */

/** Function: This method sets the left sidebar and middle area for the game.
 * Pre-conditions: A game has started on the server.
 */
function setGame() {
    setLeftSidebarGame();
    setMiddleAreaGame();
    setUsersDiv();
}

/** Function: This method sets the left sidebar for the game.
 * Pre-conditions: The game has started on the server.
 */
function setLeftSidebarGame() {
    leftSidebar.innerHTML = '';

    var turnText = "<h4>It's <span id='current-player'></span> turn!</h4><hr>";
    var instructionText = "<h4><span id='instruction-text'></span></h4><hr>";
    var playerText = "<h4>Players</h4><div class='scroll' id='players'></div><hr>";
    var audienceText = "<h4>Audience</h4><div class='scroll' id='audience'></div><hr>";
    var voteText = "<h4>Vote</h4><p id='vote-instructions'></p><div class='scroll inner-box' id='choice-list'><!-- Script will add --></div><button id='submit-button'>Submit</button>";

    $(leftSidebar).append(turnText);
    $(leftSidebar).append(instructionText);
    $(leftSidebar).append(playerText);
    $(leftSidebar).append(audienceText);
    $(leftSidebar).append(voteText);
}

/** Function: This method sets the middle area for the game.
 * Pre-conditions: The game has started on the server.
 */
function setMiddleAreaGame() {
    boardOverlay.style.display = 'none';
}

/** Function: Creates an invisible overlay over the board.
 * Pre-conditions: None.
 */
function showInvisibleBoard() {
    boardOverlay.style.display = 'block';
    boardOverlay.style.opacity = 0;
    var boardOverlayContent = document.getElementById("board-overlay-content");
    boardOverlayContent.style.display = 'none';
}

/** Function: Creates an invisible overlay over the board.
 * Pre-conditions: None.
 */
function hideInvisibleBoard() {
    boardOverlay.style.display = 'none';
}

/** Function: Sets the whole area if the client is an audience member walking in on a game.
 * Pre-conditions: A game has started, and the client has just joined. 
 */
function setForAudience() {
    // middle
    boardOverlay.style.opacity = 0;
    var boardOverlayContent = document.getElementById("board-overlay-content");
    boardOverlayContent.style.display = 'none';

    // left sidebar
    leftSidebar.innerHTML = '';

    var playerText = "<h4>Players</h4><div class='scroll' id='players'><!-- Script will add --></div><hr>";
    var audienceText = "<h4>Audience</h4><div class='scroll' id='audience'></div><hr>";

    $(leftSidebar).append(playerText);
    $(leftSidebar).append(audienceText);
    
    var waitForFinish = "Please wait for the current game to finish."
    $(leftSidebar).append(waitForFinish);
}

/* ========= Player stuff ========= */

/** Function: Sets vote counts for each player
 * Pre-conditions: Game started. setUsersDiv() has been called.
 *
 * @param voteCounts a dictionary. Keys: user ids. Values: number of counts for that user
 */
function setVoteCounts(voteCounts) {
    for (let i = 0; i < players.length; i++) {
        let playerVoteCount = document.getElementById(players[i].id + '-votecount');
        playerVoteCount.innerHTML = '' + voteCounts[players[i].id];
    }
}

/** Function: This method updates the "It's __'s turn!" text as well as the bolded username.
 * Pre-conditions: The game has started. setLeftSidebarGame() has been called. currentPlayerIndex and currentPlayer have been set.
 */
function setArtist() {
    // update "It's __'s turn!"
    var currentPlayerText = document.getElementById('current-player');
    if (isArtist) {
        currentPlayerText.innerHTML = "your";
    }
    else {
        currentPlayerText.innerHTML = currentPlayer.username + "'s";
    }

    if (isArtist) {
        hideInvisibleBoard();
    }
    else {
        showInvisibleBoard();
    }

    // update bolded text
    var playerTexts = document.getElementsByClassName('player-info');
    for (var player of playerTexts) {
        if (player.classList.contains('bolded-player')) {
            player.classList.remove('bolded-player');
        }
    }
    playerTexts[currentPlayerIndex].classList.add('bolded-player');
}

/* ========= Other ========= */

/** Function: This method sets the instruction text to display either "the word is __" or "you are the art thief"
 * Pre-conditions: The game has started and setLeftSidebarGame() has been called.
 */
function setInstructionText() {
    // update instruction text
    var instructionText = document.getElementById('instruction-text');
    var voteInstructionText = document.getElementById('vote-instructions');
    if (!isArtThief) {
        instructionText.innerHTML = `The word is "${item}."`;
        voteInstructionText.innerHTML = "Guess the Art Thief's identity.";
    }
    else {
        instructionText.innerHTML = `You are the Art Thief!`;
        voteInstructionText.innerHTML = "You have one try to guess the item. When you click Submit, the game ends.";
    }
}

/** Function: This method sets the choices for the user.
 * Pre-conditions: The game has started and setLeftSidebarGame() has been called.
 */
function setChoices() {
    var choiceList = document.getElementById('choice-list');
    choiceList.innerHTML = '';
    // go through all the choices
    for (const item of choices) {
        // create a choice button for each
        var choiceButton = document.createElement('div');
        choiceButton.classList.add('choice');
        // if they are the art thief, the choices are items
        if(isArtThief){
          choiceButton.id = item;
          choiceButton.innerHTML = item;
          choiceButton.onclick = function () {
            selectChoice(item);
          };
        // otherwise, the choices are usernames
        } else{
          choiceButton.id = item.id;
          choiceButton.innerHTML = item.username;
          choiceButton.onclick = function () {
            if(choiceButton.id == clientObject.id){
              createNotice(50,0,'Don\'t vote yourself!');
            } else{
              selectChoice(item.id);
            }
          };
        }
        choiceList.appendChild(choiceButton);
    }
}

/** Function: Sets the submit button functionality
 * Pre-conditions: The game has started, setLeftSidebarGame() has been called.
 */
function setSubmitButton () {
    var leftSideBar = document.getElementById('left-sidebar');
    var bar = document.createElement('hr');
    var extraText = document.createElement('h4');
    extraText.id = 'extra-text';
    leftSideBar.appendChild(bar);
    leftSideBar.appendChild(extraText);
    var submitButton = document.getElementById('submit-button');
    submitButton.onclick = function () {
      if(currentSelectedChoice != null){
        submitVote(currentSelectedChoice,isArtThief);
      } else{
        var notice = isArtThief ? 'Please select an item.' : 'Please select a user.'
        createNotice(50,0,notice);
      }
    };
}
