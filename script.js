let players_data = {}

function startGame() {
    playerName = document.getElementById('playerName').value;

    console.log(playerName)
    document.getElementById('input-container').style.display = 'none';
    document.getElementById('welcomeMessage').textContent = `Welcome ${playerName}, Tap any of the box below`;
    
    let new_player_data = {'name':playerName , 'highscore':0 , 'current_score':0 , 'gameover':false}
    players_data[playerName] = new_player_data

    updateLeaderboard(playerName, players_data[playerName]['highscore']);

    const chestElements = document.querySelectorAll('.treasure-chest.hide-chest');
    chestElements.forEach((chest) => {
    chest.classList.remove('hide-chest');
    });
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('highscore').textContent = highscore;
}

function generateBoxes() {
    const boxes = document.querySelectorAll('.box');
    const bombIndex = Math.floor(Math.random() * 3);
    
    boxes.forEach((box, index) => {
        box.innerHTML = ''; // Clear any previous content
        box.style.backgroundColor = 'transparent'; // Remove background color
        box.disabled = false;

        box.onclick = function () {
            if (gameOver) return;
            
            if (index === bombIndex) {
                gameOver = true;
                box.style.backgroundColor = 'red';
                if (playerScore > highscore) {
                    highscore = playerScore;
                }
                updateScore();
                alert(`Game over, ${playerName}! Your score: ${playerScore}`);
            } else {
                const points = index === 0 ? 1 : 2;
                playerScore += points;
                updateScore();
                box.style.backgroundColor = 'green';
                box.innerHTML = `+${points}`;
                setTimeout(() => {
                    generateBoxes();
                }, 1000);
            }

            //clickSound.play(); // Play the click sound
        };
    });
}

function updateLeaderboard(playerName, playerScore) {

    const leaderboardList = document.getElementById('leaderboardList');
    let text = ''

    const sorted_dict = Object.entries(players_data);
    sorted_dict.sort((a, b) => b[1]['highscore'] - a[1]['highscore']);

    for (let i = 0; i < sorted_dict.length; i++) {
        const user = sorted_dict[i][1];
        text += (i + 1) + '. ' + user['name'] + ' : '+ user['highscore'] + '\n';
      }

      leaderboardList.textContent = text;
}

function openBox(chest , playerName) {
    if (players_data[playerName['gameover']]) {
        alert(`Game over, ${playerName}! Start a new game!`);
        return; 
    }

    const outcome = Math.random();

    let points = 0;
    if (outcome < 0.4) {
        points = 10; // 40% chance of getting 10 points
    } else if (outcome < 0.7) {
        points = 15; // 30% chance of getting 15 points
    } else {
        gameOver = true; // 30% chance of hitting a bomb, game over
    }

    // Update player score
    playerScore += points;
    updateScore();

    if (gameOver) {

        if (playerScore > highscore) {
            highscore = playerScore; 
        }
    }
}
// Function to start the next round
function nextRound() {
    gameInProgress = false; // Reset the game state
    document.querySelector('.next-button button').style.display = 'none'; // Hide the "Next" button
    //generateChests();
}
