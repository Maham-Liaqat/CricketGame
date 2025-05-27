let userScore = 0;
let compScore = 0;
let userStarts = true;
let isTossDone = false;

const userScoreDisplay = document.querySelector('.userScore');
const compScoreDisplay = document.querySelector('.compScore');
const resultDisplay = document.getElementById('result');
const historyLog = document.getElementById('historyContent');
const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
const historyContainer = document.getElementById('history');
const tossModal = document.getElementById('tossModal');
const tossButton = document.getElementById('tossButton');
const tossResult = document.getElementById('tossResult');
const moveDisplay = document.getElementById('moveDisplay');
const playerMoveDisplay = document.getElementById('playerMove');
const computerMoveDisplay = document.getElementById('computerMove');
const vsDisplay = document.getElementById('vsDisplay');

const Bat = document.querySelector('.bat');
const Ball = document.querySelector('.ball');
const Stump = document.querySelector('.stump');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const tieSound = document.getElementById('tieSound');
const tossSound = document.getElementById('tossSound');

// Initialize game with toss modal
if (!isTossDone) {
  tossModal.classList.remove('hidden');
}

function doToss() {
  tossSound.play();
  tossButton.disabled = true;
  tossButton.classList.add('opacity-50');
  tossResult.textContent = "Tossing...";
  
  setTimeout(() => {
    const tossWinner = Math.random() < 0.5 ? 'player' : 'computer';
    userStarts = tossWinner === 'player';
    
    tossResult.innerHTML = `🎉 ${userStarts ? 'You' : 'Computer'} won the toss and will start first!`;
    isTossDone = true;
    
    setTimeout(() => {
      tossModal.classList.add('hidden');
      vsDisplay.textContent = userStarts ? "🏏 Your turn!" : "🤖 Computer's turn";
      
      // If computer won the toss, make it play automatically
      if (!userStarts) {
        setTimeout(() => {
          const computerChoice = getComputerChoice();
          playGame(computerChoice);
        }, 1000);
      }
    }, 2000);
  }, 1500);
}

function getComputerChoice() {
  const choices = ['🏏 Bat', '🏐 Ball', '🧱 Stump'];
  const randIndex = Math.floor(Math.random() * 3);
  return choices[randIndex];
}

function playGame(userChoice) {
  if (!isTossDone) {
    alert("Please complete the toss first!");
    return;
  }
  
  const computerChoice = getComputerChoice();
  let result = "";
  
  // Extract emoji and text
  const userEmoji = userChoice.split(' ')[0];
  const userText = userChoice.split(' ')[1];
  const compEmoji = computerChoice.split(' ')[0];
  const compText = computerChoice.split(' ')[1];

  // Show moves
  moveDisplay.classList.remove('hidden');
  playerMoveDisplay.textContent = userChoice;
  computerMoveDisplay.textContent = computerChoice;
  
  // Add animation classes based on choices
  if (userText === 'Bat') playerMoveDisplay.classList.add('bat-hit');
  if (userText === 'Ball') playerMoveDisplay.classList.add('ball-hit');
  if (userText === 'Stump') playerMoveDisplay.classList.add('stump-fall');
  
  if (compText === 'Bat') computerMoveDisplay.classList.add('bat-hit');
  if (compText === 'Ball') computerMoveDisplay.classList.add('ball-hit');
  if (compText === 'Stump') computerMoveDisplay.classList.add('stump-fall');

  if (userText === compText) {
    result = `🤝 It's a Tie! Both chose ${userText}`;
    resultDisplay.className = "text-yellow-900 animate-pulse";
    tieSound.play();
  } else if (
    (userText === 'Bat' && compText === 'Ball') ||
    (userText === 'Ball' && compText === 'Stump') ||
    (userText === 'Stump' && compText === 'Bat')
  ) {
    userScore++;
    result = `✅ You Win! ${userEmoji} beats ${compEmoji}`;
    resultDisplay.className = "text-green-800 animate-bounce";
    winSound.play();
  } else {
    compScore++;
    result = `❌ Computer Wins! ${compEmoji} beats ${userEmoji}`;
    resultDisplay.className = "text-red-800 animate-bounce";
    loseSound.play();
  }

  // Update scores
  userScoreDisplay.innerText = userScore;
  compScoreDisplay.innerText = compScore;
  resultDisplay.innerHTML = result;
  vsDisplay.textContent = userStarts ? "🏏 Your turn!" : "🤖 Computer's turn";

  const newLog = document.createElement('div');
  newLog.innerHTML = `<span class="text-black">🧑 ${userChoice} vs 🤖 ${computerChoice}</span> → <span class="${result.includes('Win') ? 'text-green-400' : result.includes('Lose') ? 'text-red-400' : 'text-yellow-300'}">${result}</span>`;
  newLog.className = "text-sm";
  historyLog.appendChild(newLog);
  historyContainer.scrollTo({ top: historyContainer.scrollHeight, behavior: 'smooth' });

  // Remove animation classes after animation completes
  setTimeout(() => {
    playerMoveDisplay.className = "";
    computerMoveDisplay.className = "";
  }, 1000);
}

function resetGame() {
  userScore = 0;
  compScore = 0;
  userScoreDisplay.innerText = 0;
  compScoreDisplay.innerText = 0;
  resultDisplay.textContent = "";
  resultDisplay.className = "";
  historyLog.innerHTML = '';
  moveDisplay.classList.add('hidden');
  isTossDone = false;
  tossModal.classList.remove('hidden');
  tossButton.disabled = false;
  tossButton.classList.remove('opacity-50');
  tossResult.textContent = "";
  vsDisplay.textContent = "VS";
}

toggleHistoryBtn.addEventListener('click', () => {
  const isHidden = historyContainer.classList.toggle('hidden');
  toggleHistoryBtn.innerText = isHidden ? '📜 Show Move History' : '❌ Hide Move History';
});

// Attach event listeners
Bat.addEventListener('click', () => playGame('🏏 Bat'));
Ball.addEventListener('click', () => playGame('🏐 Ball'));
Stump.addEventListener('click', () => playGame('🧱 Stump'));
tossButton.addEventListener('click', doToss);