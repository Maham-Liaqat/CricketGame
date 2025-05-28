// Game State Manager
    class GameState {
      constructor() {
        this.playerName = "Player";
        this.avatar = "https://i.imgur.com/JqYeYn7.png";
        this.difficulty = "medium";
        this.stats = {
          matchesPlayed: 0,
          matchesWon: 0,
          tournamentsPlayed: 0,
          tournamentsWon: 0,
          battingHighScore: 0,
          bowlingHighAccuracy: 0,
          last10Matches: []
        };
        this.loadProfile();
      }
      
      loadProfile() {
        const profile = JSON.parse(localStorage.getItem('cricketProfile'));
        if (profile) {
          this.playerName = profile.name || "Player";
          this.avatar = profile.avatar || "https://i.imgur.com/JqYeYn7.png";
          this.difficulty = profile.difficulty || "medium";
          this.stats = profile.stats || this.stats;
        }
      }
      
      saveProfile() {
        const profile = {
          name: this.playerName,
          avatar: this.avatar,
          difficulty: this.difficulty,
          stats: this.stats
        };
        localStorage.setItem('cricketProfile', JSON.stringify(profile));
      }
      
      recordMatchResult(winner) {
        this.stats.matchesPlayed++;
        if (winner === 'player') this.stats.matchesWon++;
        
        // Keep last 10 matches
        this.stats.last10Matches.unshift({
          date: new Date().toISOString(),
          result: winner === 'player' ? 'W' : (winner === 'draw' ? 'D' : 'L')
        });
        if (this.stats.last10Matches.length > 10) {
          this.stats.last10Matches.pop();
        }
        
        this.saveProfile();
      }
      
      recordTournamentResult(won) {
        this.stats.tournamentsPlayed++;
        if (won) this.stats.tournamentsWon++;
        this.saveProfile();
      }
      
      recordBattingScore(score) {
        if (score > this.stats.battingHighScore) {
          this.stats.battingHighScore = score;
          this.saveProfile();
        }
      }
      
      recordBowlingAccuracy(accuracy) {
        if (accuracy > this.stats.bowlingHighAccuracy) {
          this.stats.bowlingHighAccuracy = accuracy;
          this.saveProfile();
        }
      }
      
      getWinRate() {
        return this.stats.matchesPlayed > 0 
          ? Math.round((this.stats.matchesWon / this.stats.matchesPlayed) * 100)
          : 0;
      }
    }

    // Cricket Game Class
    class CricketGame {
      constructor(state) {
        this.state = state;
        this.rounds = 5;
        this.currentRound = 1;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.lastPlayerMove = null;
        this.playerMovePattern = [];
        this.gameActive = false;
        this.tournamentMode = false;
        this.tournamentOpponents = [];
        this.currentTournamentMatch = 0;
        
        // DOM Elements
        this.screens = {
          mainMenu: document.getElementById('mainMenu'),
          gameScreen: document.getElementById('gameScreen'),
          tournamentScreen: document.getElementById('tournamentScreen'),
          miniGamesScreen: document.getElementById('miniGamesScreen'),
          battingChallengeScreen: document.getElementById('battingChallengeScreen'),
          bowlingAccuracyScreen: document.getElementById('bowlingAccuracyScreen'),
          profileScreen: document.getElementById('profileScreen')
        };
        
        this.gameElements = {
          playerName: document.getElementById('playerName'),
          playerAvatar: document.getElementById('playerAvatar'),
          playerScore: document.getElementById('playerScore'),
          opponentName: document.getElementById('opponentName'),
          opponentAvatar: document.getElementById('opponentAvatar'),
          opponentScore: document.getElementById('opponentScore'),
          currentRound: document.getElementById('currentRound'),
          totalRounds: document.getElementById('totalRounds'),
          actionLog: document.getElementById('actionLog'),
          resultPopup: document.getElementById('resultPopup'),
          resultTitle: document.getElementById('resultTitle'),
          winnerTrophy: document.getElementById('winnerTrophy'),
          resultPlayerName: document.getElementById('resultPlayerName'),
          resultPlayerScore: document.getElementById('resultPlayerScore'),
          resultOpponentScore: document.getElementById('resultOpponentScore'),
          resultPlayerAvatar: document.getElementById('resultPlayerAvatar'),
          resultOpponentAvatar: document.getElementById('resultOpponentAvatar'),
          resultOpponentName: document.getElementById('resultOpponentName'),
          tournamentBracket: document.getElementById('tournamentBracket'),
          tournamentResultPopup: document.getElementById('tournamentResultPopup'),
          tournamentResultTitle: document.getElementById('tournamentResultTitle'),
          tournamentTrophy: document.getElementById('tournamentTrophy'),
          tournamentResultText: document.getElementById('tournamentResultText'),
          tournamentStandings: document.getElementById('tournamentStandings'),
          miniGameResultPopup: document.getElementById('miniGameResultPopup'),
          miniGameResultTitle: document.getElementById('miniGameResultTitle'),
          miniGameTrophy: document.getElementById('miniGameTrophy'),
          miniGameResultText: document.getElementById('miniGameResultText'),
          miniGameScore: document.getElementById('miniGameScore'),
          battingTime: document.getElementById('battingTime'),
          battingScore: document.getElementById('battingScore'),
          ballsFaced: document.getElementById('ballsFaced'),
          battingPitch: document.querySelector('.batting-pitch'),
          bat: document.getElementById('bat'),
          bowlingAttempts: document.getElementById('bowlingAttempts'),
          bowlingScore: document.getElementById('bowlingScore'),
          bowlingAccuracy: document.getElementById('bowlingAccuracy'),
          bowlingPitch: document.getElementById('bowlingPitch'),
          bowlingTarget: document.getElementById('bowlingTarget'),
          matchesPlayed: document.getElementById('matchesPlayed'),
          winRate: document.getElementById('winRate'),
          tournamentsWon: document.getElementById('tournamentsWon'),
          battingHighScore: document.getElementById('battingHighScore'),
          bowlingHighAccuracy: document.getElementById('bowlingHighAccuracy')
        };
        
        // Audio Elements
        this.audio = {
          bgMusic: document.getElementById('bgMusic'),
          win: document.getElementById('winSound'),
          lose: document.getElementById('loseSound'),
          tie: document.getElementById('tieSound'),
          hit: document.getElementById('hitSound'),
          bowl: document.getElementById('bowlSound')
        };
        
        this.init();
      }
      
      init() {
        this.setupEventListeners();
        this.updatePlayerInfo();
        this.updateStats();
        this.generateTournamentOpponents();
      }
      
      setupEventListeners() {
        // Menu Buttons
        document.getElementById('quickPlayBtn').addEventListener('click', () => this.startQuickPlay());
        document.getElementById('tournamentBtn').addEventListener('click', () => this.showTournamentScreen());
        document.getElementById('miniGamesBtn').addEventListener('click', () => this.showMiniGamesScreen());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('backToMenuBtn2').addEventListener('click', () => this.showMainMenu());
        document.getElementById('backToMenuBtn3').addEventListener('click', () => this.showMainMenu());
        document.getElementById('backToMiniGamesBtn').addEventListener('click', () => this.showMiniGamesScreen());
        document.getElementById('backToMiniGamesBtn2').addEventListener('click', () => this.showMiniGamesScreen());
        document.getElementById('saveProfileBtn').addEventListener('click', () => this.saveProfile());
        document.getElementById('startTournamentBtn').addEventListener('click', () => this.startTournament());
        document.getElementById('battingChallengeBtn').addEventListener('click', () => this.showBattingChallenge());
        document.getElementById('bowlingAccuracyBtn').addEventListener('click', () => this.showBowlingAccuracy());
        document.getElementById('startBattingBtn').addEventListener('click', () => this.startBattingChallenge());
        document.getElementById('startBowlingBtn').addEventListener('click', () => this.startBowlingAccuracy());
        
        // Game Buttons
        document.getElementById('batBtn').addEventListener('click', () => this.playRound('bat'));
        document.getElementById('ballBtn').addEventListener('click', () => this.playRound('ball'));
        document.getElementById('stumpBtn').addEventListener('click', () => this.playRound('stump'));
        document.getElementById('quitBtn').addEventListener('click', () => this.endGame());
        document.getElementById('resultCloseBtn').addEventListener('click', () => this.closeResultPopup());
        document.getElementById('tournamentResultCloseBtn').addEventListener('click', () => this.closeTournamentResultPopup());
        document.getElementById('miniGameResultCloseBtn').addEventListener('click', () => this.closeMiniGameResultPopup());
        
        // Batting challenge controls
        document.addEventListener('keydown', (e) => {
          if (this.battingChallengeActive) {
            if (e.key === 'ArrowLeft') {
              this.batAngle = Math.max(this.batAngle - 5, -30);
              this.updateBatPosition();
            } else if (e.key === 'ArrowRight') {
              this.batAngle = Math.min(this.batAngle + 5, 30);
              this.updateBatPosition();
            } else if (e.key === ' ') {
              this.swingBat();
            }
          }
        });
        
        // Bowling accuracy controls
        this.gameElements.bowlingPitch.addEventListener('click', (e) => {
          if (this.bowlingChallengeActive) {
            this.bowlBall(e.clientX, e.clientY);
          }
        });
        
        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
          option.addEventListener('click', () => {
            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
          });
        });
      }
      
      updatePlayerInfo() {
        this.gameElements.playerName.textContent = this.state.playerName;
        this.gameElements.playerAvatar.src = this.state.avatar;
      }
      
      updateStats() {
        this.gameElements.matchesPlayed.textContent = this.state.stats.matchesPlayed;
        this.gameElements.winRate.textContent = this.state.getWinRate();
        this.gameElements.tournamentsWon.textContent = this.state.stats.tournamentsWon;
        this.gameElements.battingHighScore.textContent = this.state.stats.battingHighScore;
        this.gameElements.bowlingHighAccuracy.textContent = this.state.stats.bowlingHighAccuracy;
        
        // Update stat bars
        document.querySelectorAll('.stat-fill').forEach(fill => {
          const parent = fill.parentElement;
          const statValue = parseInt(parent.previousElementSibling.textContent);
          
          if (parent.id.includes('Rate') || parent.id.includes('Accuracy')) {
            fill.style.width = `${statValue}%`;
          } else {
            // For other stats, we'll use a logarithmic scale to show progress
            const max = 100; // Adjust based on expected maximum
            const percentage = Math.min(100, (statValue / max) * 100);
            fill.style.width = `${percentage}%`;
          }
        });
      }
      
      saveProfile() {
        this.state.playerName = document.getElementById('playerNameInput').value || "Player";
        this.state.avatar = document.querySelector('.avatar-option.selected').dataset.avatar;
        this.state.difficulty = document.getElementById('difficultySelect').value;
        this.state.saveProfile();
        this.updatePlayerInfo();
        this.updateStats();
        this.showMainMenu();
      }
      
      startQuickPlay() {
        this.tournamentMode = false;
        this.resetGame();
        this.setOpponent("Computer", "https://i.imgur.com/5X5jKlK.png", this.state.difficulty);
        this.showScreen('gameScreen');
        this.playBackgroundMusic();
        this.gameActive = true;
      }
      
      generateTournamentOpponents() {
        this.tournamentOpponents = [
          { name: "Rookie", avatar: "https://i.imgur.com/8Km9tLL.png", difficulty: "easy" },
          { name: "Challenger", avatar: "https://i.imgur.com/3QZQZ9Q.png", difficulty: "medium" },
          { name: "Veteran", avatar: "https://i.imgur.com/5X5jKlK.png", difficulty: "hard" },
          { name: "Champion", avatar: "https://i.imgur.com/QWEdQBb.png", difficulty: "hard" }
        ];
      }
      
      showTournamentScreen() {
        this.generateTournamentBracket();
        this.showScreen('tournamentScreen');
      }
      
      generateTournamentBracket() {
        const bracketHTML = `
          <div class="bracket-match ${this.currentTournamentMatch === 0 ? 'current-match' : ''}">
            <div class="bracket-player">
              <img src="${this.state.avatar}" class="bracket-avatar">
              <span>${this.state.playerName}</span>
            </div>
            <div class="bracket-vs">vs</div>
            <div class="bracket-player">
              <img src="${this.tournamentOpponents[0].avatar}" class="bracket-avatar">
              <span>${this.tournamentOpponents[0].name}</span>
            </div>
            <div class="bracket-score" id="match1Score">-</div>
          </div>
          <div class="bracket-match ${this.currentTournamentMatch === 1 ? 'current-match' : ''}">
            <div class="bracket-player">
              <img src="${this.tournamentOpponents[1].avatar}" class="bracket-avatar">
              <span>${this.tournamentOpponents[1].name}</span>
            </div>
            <div class="bracket-vs">vs</div>
            <div class="bracket-player">
              <img src="${this.tournamentOpponents[2].avatar}" class="bracket-avatar">
              <span>${this.tournamentOpponents[2].name}</span>
            </div>
            <div class="bracket-score" id="match2Score">-</div>
          </div>
          <div class="bracket-match ${this.currentTournamentMatch === 2 ? 'current-match' : ''}">
            <div class="bracket-player">
              <span>Final Match</span>
            </div>
            <div class="bracket-vs">vs</div>
            <div class="bracket-player">
              <img src="${this.tournamentOpponents[3].avatar}" class="bracket-avatar">
              <span>${this.tournamentOpponents[3].name}</span>
            </div>
            <div class="bracket-score" id="finalScore">-</div>
          </div>
        `;
        
        this.gameElements.tournamentBracket.innerHTML = bracketHTML;
      }
      
      startTournament() {
        this.tournamentMode = true;
        this.currentTournamentMatch = 0;
        this.startNextTournamentMatch();
      }
      
      startNextTournamentMatch() {
        if (this.currentTournamentMatch < this.tournamentOpponents.length) {
          const opponent = this.tournamentOpponents[this.currentTournamentMatch];
          this.resetGame();
          this.setOpponent(opponent.name, opponent.avatar, opponent.difficulty);
          this.showScreen('gameScreen');
          this.gameActive = true;
        } else {
          this.showTournamentResult(true);
        }
      }
      
      setOpponent(name, avatar, difficulty) {
        this.gameElements.opponentName.textContent = `${name} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;
        this.gameElements.opponentAvatar.src = avatar;
        this.currentDifficulty = difficulty;
      }
      
      playRound(playerMove) {
        if (!this.gameActive) return;
        
        // Animate player move
        this.animateMove(playerMove, true);
        
        // Computer makes move after short delay
        setTimeout(() => {
          const opponentMove = this.getComputerMove();
          this.animateMove(opponentMove, false);
          
          // Determine result after animations
          setTimeout(() => {
            const result = this.determineWinner(playerMove, opponentMove);
            this.displayResult(playerMove, opponentMove, result);
            this.updateScores(result);
            
            // Check if game should continue
            if (this.currentRound >= this.rounds) {
              this.showResultPopup();
            } else {
              this.currentRound++;
              this.gameElements.currentRound.textContent = this.currentRound;
            }
          }, 500);
        }, 500);
      }
      
      getComputerMove() {
        // Store player move for pattern recognition
        if (this.lastPlayerMove) {
          this.playerMovePattern.push(this.lastPlayerMove);
          if (this.playerMovePattern.length > 5) {
            this.playerMovePattern.shift();
          }
        }
        this.lastPlayerMove = null;
        
        // Difficulty-based AI
        switch(this.currentDifficulty) {
          case 'easy':
            return this.getRandomMove();
          case 'medium':
            return this.getMediumMove();
          case 'hard':
            return this.getHardMove();
          default:
            return this.getRandomMove();
        }
      }
      
      getRandomMove() {
        const moves = ['bat', 'ball', 'stump'];
        return moves[Math.floor(Math.random() * moves.length)];
      }
      
      getMediumMove() {
        // 60% chance to counter last move, 40% random
        if (this.lastPlayerMove && Math.random() < 0.6) {
          const counters = {
            bat: 'stump',
            ball: 'bat',
            stump: 'ball'
          };
          return counters[this.lastPlayerMove];
        }
        return this.getRandomMove();
      }
      
      getHardMove() {
        // Detect player patterns
        if (this.playerMovePattern.length >= 3) {
          // Check if player is repeating moves
          const lastThree = this.playerMovePattern.slice(-3);
          if (new Set(lastThree).size === 1) {
            // Player is repeating, counter their move
            const counters = {
              bat: 'stump',
              ball: 'bat',
              stump: 'ball'
            };
            return counters[lastThree[0]];
          }
          
          // Check for simple patterns (e.g., bat -> ball -> stump)
          if (this.isPattern(lastThree, ['bat', 'ball', 'stump'])) {
            return 'bat'; // Expecting bat next, counter with stump
          }
        }
        
        // Default to medium AI if no pattern detected
        return this.getMediumMove();
      }
      
      isPattern(moves, pattern) {
        for (let i = 0; i < moves.length; i++) {
          if (moves[i] !== pattern[i % pattern.length]) {
            return false;
          }
        }
        return true;
      }
      
      animateMove(move, isPlayer) {
        const moveEmoji = {
          bat: '🏏',
          ball: '🏐',
          stump: '🧱'
        };
        
        const element = isPlayer ? 
          document.getElementById('playerAvatar') : 
          document.querySelector('.opponent-info .avatar');
        
        // Create temporary move indicator
        const moveIndicator = document.createElement('div');
        moveIndicator.className = 'move-indicator';
        moveIndicator.textContent = moveEmoji[move];
        moveIndicator.style.position = 'absolute';
        moveIndicator.style.fontSize = '2rem';
        moveIndicator.style.animation = isPlayer ? 'batHit 0.5s ease' : 'ballHit 0.5s ease';
        
        element.parentNode.appendChild(moveIndicator);
        
        // Remove after animation
        setTimeout(() => {
          moveIndicator.remove();
        }, 500);
      }
      
      determineWinner(playerMove, opponentMove) {
        if (playerMove === opponentMove) return 'draw';
        
        const winConditions = {
          bat: 'ball',
          ball: 'stump',
          stump: 'bat'
        };
        
        return winConditions[playerMove] === opponentMove ? 'player' : 'opponent';
      }
      
      displayResult(playerMove, opponentMove, result) {
        const moveNames = {
          bat: 'Bat',
          ball: 'Ball',
          stump: 'Stump'
        };
        
        const moveEmojis = {
          bat: '🏏',
          ball: '🏐',
          stump: '🧱'
        };
        
        const resultText = {
          player: 'You Win!',
          opponent: 'Opponent Wins!',
          draw: "It's a Tie!"
        };
        
        const resultClass = {
          player: 'player',
          opponent: 'opponent',
          draw: 'draw'
        };
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${resultClass[result]}`;
        logEntry.innerHTML = `
          <span>${moveEmojis[playerMove]} ${moveNames[playerMove]}</span>
          <span class="vs">vs</span>
          <span>${moveEmojis[opponentMove]} ${moveNames[opponentMove]}</span>
          <span class="result">${resultText[result]}</span>
        `;
        
        this.gameElements.actionLog.prepend(logEntry);
        
        // Play sound and effects based on result
        if (result === 'player') {
          this.playSound('win');
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else if (result === 'opponent') {
          this.playSound('lose');
          document.querySelector('.opponent-info').classList.add('shake-animation');
          setTimeout(() => {
            document.querySelector('.opponent-info').classList.remove('shake-animation');
          }, 500);
        } else {
          this.playSound('tie');
        }
      }
      
      updateScores(result) {
        if (result === 'player') {
          this.playerScore++;
          this.gameElements.playerScore.textContent = this.playerScore;
        } else if (result === 'opponent') {
          this.opponentScore++;
          this.gameElements.opponentScore.textContent = this.opponentScore;
        }
      }
      
      showResultPopup() {
        this.gameActive = false;
        
        const winner = this.playerScore > this.opponentScore ? 'player' : 
                      this.playerScore < this.opponentScore ? 'opponent' : 'draw';
        
        // Update result popup content
        this.gameElements.resultPlayerName.textContent = this.state.playerName;
        this.gameElements.resultPlayerScore.textContent = this.playerScore;
        this.gameElements.resultOpponentScore.textContent = this.opponentScore;
        this.gameElements.resultPlayerAvatar.src = this.state.avatar;
        this.gameElements.resultOpponentAvatar.src = this.gameElements.opponentAvatar.src;
        this.gameElements.resultOpponentName.textContent = this.gameElements.opponentName.textContent;
        
        if (winner === 'player') {
          this.gameElements.resultTitle.textContent = "You Won the Match!";
          this.gameElements.winnerTrophy.textContent = "🏆";
          this.gameElements.winnerTrophy.style.color = "gold";
          this.state.recordMatchResult('player');
        } else if (winner === 'opponent') {
          this.gameElements.resultTitle.textContent = `${this.gameElements.opponentName.textContent} Won`;
          this.gameElements.winnerTrophy.textContent = "💻";
          this.gameElements.winnerTrophy.style.color = "silver";
          this.state.recordMatchResult('opponent');
        } else {
          this.gameElements.resultTitle.textContent = "Match Ended in a Draw";
          this.gameElements.winnerTrophy.textContent = "🤝";
          this.gameElements.winnerTrophy.style.color = "white";
          this.state.recordMatchResult('draw');
        }
        
        // Show the popup
        this.gameElements.resultPopup.classList.add('active');
        
        // If in tournament mode, proceed to next match
        if (this.tournamentMode) {
          if (winner === 'player') {
            this.currentTournamentMatch++;
            if (this.currentTournamentMatch < this.tournamentOpponents.length) {
              document.getElementById('resultCloseBtn').textContent = "Next Match";
            } else {
              document.getElementById('resultCloseBtn').textContent = "See Tournament Results";
            }
          } else {
            // Player lost the tournament
            this.showTournamentResult(false);
          }
        }
      }
      
      closeResultPopup() {
        this.gameElements.resultPopup.classList.remove('active');
        
        if (this.tournamentMode && this.playerScore > this.opponentScore) {
          if (this.currentTournamentMatch < this.tournamentOpponents.length) {
            this.startNextTournamentMatch();
          } else {
            this.showTournamentResult(true);
          }
        } else {
          this.showMainMenu();
        }
      }
      
      showTournamentResult(won) {
        this.state.recordTournamentResult(won);
        
        if (won) {
          this.gameElements.tournamentResultTitle.textContent = "Tournament Champion!";
          this.gameElements.tournamentTrophy.textContent = "🏆";
          this.gameElements.tournamentResultText.textContent = "You won the tournament!";
        } else {
          this.gameElements.tournamentResultTitle.textContent = "Tournament Over";
          this.gameElements.tournamentTrophy.textContent = "😢";
          this.gameElements.tournamentResultText.textContent = "You were eliminated from the tournament";
        }
        
        // Generate standings
        let standingsHTML = '';
        this.tournamentOpponents.forEach((opponent, index) => {
          const result = index < this.currentTournamentMatch ? "Won" : (index === this.currentTournamentMatch ? "Lost" : "Not Played");
          standingsHTML += `
            <div class="standing-item">
              <div>${index + 1}. ${opponent.name}</div>
              <div>${result}</div>
            </div>
          `;
        });
        
        this.gameElements.tournamentStandings.innerHTML = standingsHTML;
        this.gameElements.tournamentResultPopup.classList.add('active');
      }
      
      closeTournamentResultPopup() {
        this.gameElements.tournamentResultPopup.classList.remove('active');
        this.showMainMenu();
      }
      
      showMiniGamesScreen() {
        this.showScreen('miniGamesScreen');
      }
      
      showBattingChallenge() {
        this.showScreen('battingChallengeScreen');
      }
      
      showBowlingAccuracy() {
        this.showScreen('bowlingAccuracyScreen');
      }
      
      startBattingChallenge() {
        this.battingChallengeActive = true;
        this.battingScore = 0;
        this.ballsFaced = 0;
        this.batAngle = 0;
        this.gameElements.battingScore.textContent = "0";
        this.gameElements.ballsFaced.textContent = "0";
        
        // Set up bat
        this.updateBatPosition();
        
        // Start timer (30 seconds)
        let timeLeft = 30;
        this.gameElements.battingTime.textContent = timeLeft;
        
        this.battingTimer = setInterval(() => {
          timeLeft--;
          this.gameElements.battingTime.textContent = timeLeft;
          
          if (timeLeft <= 0) {
            this.endBattingChallenge();
          }
        }, 1000);
        
        // Start ball throwing
        this.throwBall();
        
        document.getElementById('startBattingBtn').style.display = 'none';
      }
      
      updateBatPosition() {
        this.gameElements.bat.style.transform = `translateX(-50%) rotate(${this.batAngle}deg)`;
      }
      
      swingBat() {
        this.gameElements.bat.classList.add('swing-animation');
        setTimeout(() => {
          this.gameElements.bat.classList.remove('swing-animation');
        }, 500);
      }
      
      throwBall() {
        if (!this.battingChallengeActive) return;
        
        // Create a new ball
        const ball = document.createElement('div');
        ball.className = 'ball';
        
        // Random starting position (top of screen)
        const startX = Math.random() * (this.gameElements.battingPitch.offsetWidth - 30);
        ball.style.left = `${startX}px`;
        ball.style.top = '0px';
        
        this.gameElements.battingPitch.appendChild(ball);
        
        // Random speed (1-3 seconds to reach bottom)
        const duration = 1000 + Math.random() * 2000;
        
        // Animate ball falling
        const animation = ball.animate([
          { top: '0px' },
          { top: `${this.gameElements.battingPitch.offsetHeight - 30}px` }
        ], {
          duration: duration,
          easing: 'linear'
        });
        
        animation.onfinish = () => {
          if (this.battingChallengeActive) {
            this.ballsFaced++;
            this.gameElements.ballsFaced.textContent = this.ballsFaced;
            ball.remove();
            this.throwBall(); // Throw next ball
          }
        };
        
        // Check for hit
        const checkHit = setInterval(() => {
          const ballRect = ball.getBoundingClientRect();
          const batRect = this.gameElements.bat.getBoundingClientRect();
          
          if (this.isColliding(ballRect, batRect)) {
            clearInterval(checkHit);
            animation.cancel();
            this.hitBall(ball);
          }
        }, 16);
      }
      
      isColliding(rect1, rect2) {
        return !(
          rect1.right < rect2.left || 
          rect1.left > rect2.right || 
          rect1.bottom < rect2.top || 
          rect1.top > rect2.bottom
        );
      }
      
      hitBall(ball) {
        this.audio.hit.play();
        this.swingBat();
        
        // Score points based on hit angle
        const hitPower = 1 + Math.abs(this.batAngle) / 30; // 1-2x multiplier
        const points = Math.floor(10 * hitPower);
        this.battingScore += points;
        this.gameElements.battingScore.textContent = this.battingScore;
        
        // Animate ball flying away
        const angle = this.batAngle > 0 ? this.batAngle + 90 : 90 - Math.abs(this.batAngle);
        const radians = angle * (Math.PI / 180);
        const distance = 200;
        
        ball.animate([
          { 
            top: `${ball.style.top}`,
            left: `${ball.style.left}`,
            opacity: 1
          },
          { 
            top: `${parseInt(ball.style.top) - Math.sin(radians) * distance}px`,
            left: `${parseInt(ball.style.left) + Math.cos(radians) * distance}px`,
            opacity: 0
          }
        ], {
          duration: 500,
          easing: 'ease-out'
        });
        
        setTimeout(() => {
          ball.remove();
          this.throwBall(); // Throw next ball
        }, 500);
      }
      
      endBattingChallenge() {
        this.battingChallengeActive = false;
        clearInterval(this.battingTimer);
        
        // Record high score
        this.state.recordBattingScore(this.battingScore);
        this.updateStats();
        
        // Show result
        this.gameElements.miniGameResultTitle.textContent = "Batting Challenge Complete";
        this.gameElements.miniGameScore.textContent = this.battingScore;
        
        if (this.battingScore >= 100) {
          this.gameElements.miniGameTrophy.textContent = "🏆";
          this.gameElements.miniGameTrophy.style.color = "gold";
        } else if (this.battingScore >= 50) {
          this.gameElements.miniGameTrophy.textContent = "🥈";
          this.gameElements.miniGameTrophy.style.color = "silver";
        } else {
          this.gameElements.miniGameTrophy.textContent = "😊";
          this.gameElements.miniGameTrophy.style.color = "white";
        }
        
        this.gameElements.miniGameResultPopup.classList.add('active');
        document.getElementById('startBattingBtn').style.display = 'block';
      }
      
      startBowlingAccuracy() {
        this.bowlingChallengeActive = true;
        this.bowlingAttempts = 0;
        this.bowlingHits = 0;
        this.gameElements.bowlingAttempts.textContent = "0/10";
        this.gameElements.bowlingScore.textContent = "0";
        this.gameElements.bowlingAccuracy.textContent = "0%";
        
        // Position target randomly
        this.positionTarget();
        
        document.getElementById('startBowlingBtn').style.display = 'none';
      }
      
      positionTarget() {
        const pitch = this.gameElements.bowlingPitch;
        const target = this.gameElements.bowlingTarget;
        
        const maxX = pitch.offsetWidth - 50;
        const maxY = pitch.offsetHeight - 100; // Don't go too low
        
        const x = 50 + Math.random() * (maxX - 50);
        const y = 50 + Math.random() * (maxY - 50);
        
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;
      }
      
      bowlBall(clickX, clickY) {
        if (!this.bowlingChallengeActive || this.bowlingAttempts >= 10) return;
        
        this.bowlingAttempts++;
        this.gameElements.bowlingAttempts.textContent = `${this.bowlingAttempts}/10`;
        
        this.audio.bowl.play();
        
        // Create ball at top center
        const ball = document.createElement('div');
        ball.className = 'ball';
        const pitch = this.gameElements.bowlingPitch;
        const pitchRect = pitch.getBoundingClientRect();
        
        const startX = pitch.offsetWidth / 2 - 15;
        const startY = 0;
        
        ball.style.left = `${startX}px`;
        ball.style.top = `${startY}px`;
        pitch.appendChild(ball);
        
        // Calculate end position (click position relative to pitch)
        const endX = clickX - pitchRect.left - 15;
        const endY = clickY - pitchRect.top - 15;
        
        // Animate ball
        const animation = ball.animate([
          { top: `${startY}px`, left: `${startX}px` },
          { top: `${endY}px`, left: `${endX}px` }
        ], {
          duration: 500,
          easing: 'ease-in'
        });
        
        animation.onfinish = () => {
          // Check if hit target
          const ballRect = ball.getBoundingClientRect();
          const targetRect = this.gameElements.bowlingTarget.getBoundingClientRect();
          
          if (this.isColliding(ballRect, targetRect)) {
            this.bowlingHits++;
            this.gameElements.bowlingScore.textContent = this.bowlingHits * 10;
            
            // Calculate accuracy
            const accuracy = Math.round((this.bowlingHits / this.bowlingAttempts) * 100);
            this.gameElements.bowlingAccuracy.textContent = `${accuracy}%`;
            
            // Show hit effect
            this.gameElements.bowlingTarget.style.backgroundColor = "rgba(0, 255, 0, 0.3)";
            setTimeout(() => {
              this.gameElements.bowlingTarget.style.backgroundColor = "";
            }, 200);
          }
          
          ball.remove();
          
          // Next attempt or end game
          if (this.bowlingAttempts < 10) {
            this.positionTarget();
          } else {
            this.endBowlingChallenge();
          }
        };
      }
      
      endBowlingChallenge() {
        this.bowlingChallengeActive = false;
        
        // Calculate final accuracy
        const accuracy = Math.round((this.bowlingHits / 10) * 100);
        
        // Record high accuracy
        this.state.recordBowlingAccuracy(accuracy);
        this.updateStats();
        
        // Show result
        this.gameElements.miniGameResultTitle.textContent = "Bowling Challenge Complete";
        this.gameElements.miniGameScore.textContent = `${accuracy}% Accuracy`;
        
        if (accuracy >= 80) {
          this.gameElements.miniGameTrophy.textContent = "🏆";
          this.gameElements.miniGameTrophy.style.color = "gold";
        } else if (accuracy >= 50) {
          this.gameElements.miniGameTrophy.textContent = "🥈";
          this.gameElements.miniGameTrophy.style.color = "silver";
        } else {
          this.gameElements.miniGameTrophy.textContent = "😊";
          this.gameElements.miniGameTrophy.style.color = "white";
        }
        
        this.gameElements.miniGameResultPopup.classList.add('active');
        document.getElementById('startBowlingBtn').style.display = 'block';
      }
      
      closeMiniGameResultPopup() {
        this.gameElements.miniGameResultPopup.classList.remove('active');
        this.showMiniGamesScreen();
      }
      
      resetGame() {
        this.currentRound = 1;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.lastPlayerMove = null;
        this.playerMovePattern = [];
        
        this.gameElements.playerScore.textContent = '0';
        this.gameElements.opponentScore.textContent = '0';
        this.gameElements.currentRound.textContent = '1';
        this.gameElements.totalRounds.textContent = this.rounds;
        this.gameElements.actionLog.innerHTML = '';
      }
      
      playBackgroundMusic() {
        this.audio.bgMusic.volume = 0.3;
        this.audio.bgMusic.play().catch(e => console.log("Auto-play prevented:", e));
      }
      
      playSound(type) {
        const sound = this.audio[type];
        if (sound) {
          sound.currentTime = 0;
          sound.play();
        }
      }
      
      showScreen(screenId) {
        Object.values(this.screens).forEach(screen => {
          screen.classList.remove('active');
        });
        this.screens[screenId].classList.add('active');
      }
      
      showMainMenu() {
        this.showScreen('mainMenu');
        this.audio.bgMusic.pause();
      }
      
      showProfile() {
        // Load current profile data into form
        document.getElementById('playerNameInput').value = this.state.playerName;
        document.getElementById('difficultySelect').value = this.state.difficulty;
        document.querySelectorAll('.avatar-option').forEach(option => {
          option.classList.remove('selected');
          if (option.dataset.avatar === this.state.avatar) {
            option.classList.add('selected');
          }
        });
        
        this.updateStats();
        this.showScreen('profileScreen');
      }
      
      endGame() {
        if (this.battingChallengeActive) {
          this.endBattingChallenge();
        } else if (this.bowlingChallengeActive) {
          this.endBowlingChallenge();
        } else {
          this.showMainMenu();
        }
      }
    }

    // Initialize the game when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      const gameState = new GameState();
      const game = new CricketGame(gameState);
    });