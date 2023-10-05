let player = {'name': null, 'highscore':0 , 'current_score':0 , 'opened_chest':false, 'gameover':false};
let players_data = []

// load sound
const chest_open_audio = new Audio('chest.mp3');

function startGame() {
    playerName = document.getElementById('playerName').value;

    console.log(playerName)
    document.getElementById('input-container').style.display = 'none';
    document.getElementById('welcomeMessage').textContent = `Welcome ${playerName}, Tap any of the box below`;
    
    player.name = playerName
    players_data.push(player);

    updateLeaderboard(playerName, player['highscore']);

    const chestElements = document.querySelectorAll('.treasure-chest.hide-chest');
    chestElements.forEach((chest) => {
    chest.classList.remove('hide-chest');
    });
}

function updateScore() {
    document.getElementById('playerScore').textContent = player.current_score;
    document.getElementById('highscore').textContent = player.highscore;
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

    const sorted_arr = Object.entries(players_data);
    sorted_arr.sort((a, b) => b[1]['highscore'] - a[1]['highscore']);

    for (let i = 0; i < sorted_arr.length; i++) {
        const user = sorted_arr[i][1];
        text += (i + 1) + '. ' + user['name'] + ' : '+ user['highscore'] + '\n';
      }

      leaderboardList.textContent = text;
}

function openBox(chest , playerName) {
    if (player.gameover) {
        alert(`Game over, ${playerName}! Start a new game!`);
        return; 
    }

    if (player.opened_chest) {
        return;
    }

    chest_open_audio.play();

     // change chest image
    chest.firstElementChild.src = "images/open_chest.jpg";

    const outcome = Math.random();
    let points = 0;

    if (outcome < 0.4) {
        points = 10; // 40% chance of getting 10 points
    } else if (outcome < 0.7) {
        points = 15; // 30% chance of getting 15 points
    } else {
        player.gameover = true; // 30% chance of hitting a bomb, game over
    }

    // Update player score
    player.current_score += points;
    player.opened_chest = true;

    if (player.current_score > player.highscore) {
        player.highscore = player.current_score
        updateLeaderboard();
    }

    updateScore();
}
// Function to start the next round
function nextRound() {
    gameInProgress = false; // Reset the game state
    document.querySelector('.next-button button').style.display = 'none'; // Hide the "Next" button
    //generateChests();
}
