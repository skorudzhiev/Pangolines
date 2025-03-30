<template>
  <div class="game-container" ref="gameContainer" tabindex="0" @keydown="handleKeyDown" @keyup="handleKeyUp">
    <canvas ref="gameCanvas" :width="gameWidth" :height="gameHeight"></canvas>
    <div v-if="!gameRunning && !gameOver.value" class="game-start">
      <h1>Pang</h1>
      <div class="game-modes">
        <button @click="startGame(false)">Arcade Mode</button>
        <button @click="startGame(true)">Classic Mode</button>
      </div>
      <div v-if="highScore > 0" class="high-score">High Score: {{ highScore }}</div>
    </div>
    <div v-if="gameOver.value" class="game-over">
      <h1>Game Over</h1>
      <div class="score-display">Score: {{ score.value }}</div>
      <div v-if="highScore > 0" class="high-score">High Score: {{ highScore }}</div>
      <button @click="resetGame">Play Again</button>
    </div>
    <div v-if="gameRunning" class="game-ui">
      <div class="score-container">
        <div class="score-display">Score: {{ score.value }}</div>
        <div class="combo-display" :class="{ active: comboCounter > 0 }">
          <span class="combo-counter">{{ comboCounter }}x Combo</span>
          <span class="combo-multiplier">{{ comboMultiplier.toFixed(1) }}x Multiplier</span>
        </div>
      </div>
      <div v-if="classicMode" class="level-display">Level: {{ currentLevel }}</div>
      <div v-else class="difficulty-display">Difficulty: {{ Math.floor(difficulty * 10) / 10 }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameLoop } from '../composables/gameLoop';
import { usePlayer } from '../composables/player';
import { useBubbles } from '../composables/bubbles';
import { useProjectiles } from '../composables/projectiles';
import { useCollisions } from '../composables/collisions';

// Game properties
const gameWidth = 1024;
const gameHeight = 768;
const gameContainer = ref(null);
const gameCanvas = ref(null);
const gameRunning = ref(false);
const classicMode = ref(false);
const currentLevel = ref(1);
const highScore = ref(0);
const comboCounter = ref(0);
const comboMultiplier = ref(1);
const comboTimeoutId = ref(null);
let ctx = null;

// Difficulty scaling
const difficulty = ref(1);

// Floating text animation for scores
const floatingTexts = ref([]);
window.floatingTexts = floatingTexts.value;

// Game state
const keysPressed = ref({
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
});

// Initialize game components
const { startGameLoop, stopGameLoop } = useGameLoop();
const { player, updatePlayer, drawPlayer, resetPlayer } = usePlayer(gameWidth, gameHeight);
const { bubbles, updateBubbles, drawBubbles, resetBubbles, initializeLevel, addRandomBubbles } = useBubbles(gameWidth, gameHeight);
const { projectiles, updateProjectiles, drawProjectiles, fireProjectile, resetProjectiles } = useProjectiles();
const { score, gameOver, checkCollisions, resetGameState, onBubbleHit } = useCollisions(player, bubbles, projectiles);

// Handle combo system
const resetCombo = () => {
  comboCounter.value = 0;
  comboMultiplier.value = 1;
};

const increaseCombo = () => {
  // Clear any existing timeout
  if (comboTimeoutId.value) {
    clearTimeout(comboTimeoutId.value);
  }
  
  // Increment combo counter
  comboCounter.value++;
  
  // Increase multiplier every 3 hits
  comboMultiplier.value = 1 + Math.floor(comboCounter.value / 3) * 0.5;
  
  // Set timeout to reset combo if no hits for 3 seconds
  comboTimeoutId.value = setTimeout(() => {
    resetCombo();
  }, 3000);
};

// Listen for bubble hits to increase combo
onBubbleHit(() => {
  increaseCombo();
});

// Handle keyboard input
const handleKeyDown = (e) => {
  if (e.code === 'ArrowLeft') keysPressed.value.ArrowLeft = true;
  if (e.code === 'ArrowRight') keysPressed.value.ArrowRight = true;
  if (e.code === 'Space') {
    keysPressed.value.Space = true;
    if (gameRunning.value) fireProjectile(player.value.x + player.value.width / 2, player.value.y);
  }
  
  // Prevent scrolling when pressing space or arrow keys
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
  e.preventDefault();
};

const handleKeyUp = (e) => {
  if (e.code === 'ArrowLeft') keysPressed.value.ArrowLeft = false;
  if (e.code === 'ArrowRight') keysPressed.value.ArrowRight = false;
  if (e.code === 'Space') keysPressed.value.Space = false;
  e.preventDefault();
};

// Game loop function
const updateGame = () => {
  if (!gameRunning.value) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, gameWidth, gameHeight);
  
  // Update player movement based on keys pressed
  updatePlayer(keysPressed.value);
  
  // Update projectiles
  updateProjectiles(gameHeight);
  
  // Update bubbles
  updateBubbles();
  
  // Check collisions
  checkCollisions(comboMultiplier.value);
  
  // Draw everything
  drawBubbles(ctx);
  drawProjectiles(ctx);
  drawPlayer(ctx);
  
  // Draw floating score texts
  drawFloatingTexts(ctx);
  
  // Check game over condition
  if (gameOver.value) {
    console.log('Game over detected:', gameOver.value);
    gameRunning.value = false;
    stopGameLoop();
    // Update high score if necessary
    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('pangHighScore', highScore.value.toString());
    }
  }
  
  // Check if level is completed (no bubbles left) in classic mode
  if (classicMode.value && bubbles.value.length === 0) {
    advanceToNextLevel();
  }
  
  // In arcade mode, add more bubbles if they're running low
  if (!classicMode.value && bubbles.value.length < 3 && Math.random() < 0.02) {
    // Increase difficulty over time
    difficulty.value += 0.05;
    addRandomBubbles(Math.min(Math.floor(difficulty.value), 3), difficulty.value);
  }
};

// Level configurations
const levelConfigurations = [
  // Level 1 - Standard start
  { bubbleCounts: [2, 0, 0], speeds: [1, 1, 1] },
  // Level 2 - More bubbles
  { bubbleCounts: [2, 2, 0], speeds: [1, 1, 1] },
  // Level 3 - All sizes
  { bubbleCounts: [2, 2, 2], speeds: [1, 1, 1] },
  // Level 4 - Faster
  { bubbleCounts: [3, 2, 1], speeds: [1.1, 1.1, 1.1] },
  // Level 5 - Even faster
  { bubbleCounts: [3, 3, 2], speeds: [1.2, 1.2, 1.2] },
  // Level 6 and beyond - Increasing speed
  { bubbleCounts: [4, 3, 2], speeds: [1.3, 1.3, 1.3] }
];

// Advance to next level
const advanceToNextLevel = () => {
  currentLevel.value++;
  
  // Get level configuration (use last config for levels beyond defined configs)
  const levelIndex = Math.min(currentLevel.value - 1, levelConfigurations.length - 1);
  const levelConfig = levelConfigurations[levelIndex];
  
  // Initialize level with configuration
  initializeLevel(levelConfig.bubbleCounts, levelConfig.speeds);
};

// Reset game completely
const resetGame = () => {
  gameOver.value = false;
  resetGameState();
  currentLevel.value = 1;
  resetCombo();
  floatingTexts.value = [];
  window.floatingTexts = floatingTexts.value;
  difficulty.value = 1;
  
  // Ensure the game container has focus
  if (gameContainer.value) {
    gameContainer.value.focus();
  }
};

// Start the game
const startGame = (classic = false) => {
  if (gameRunning.value) return;
  
  // Set game mode
  classicMode.value = classic;
  
  // Reset game components
  resetGame();
  resetPlayer();
  resetProjectiles();
  
  // Initialize appropriate level
  if (classic) {
    // Initialize first level
    const levelConfig = levelConfigurations[0];
    initializeLevel(levelConfig.bubbleCounts, levelConfig.speeds);
  } else {
    // Arcade mode just uses the default bubble initialization
    resetBubbles();
  }
  
  gameRunning.value = true;
  gameContainer.value.focus();
  
  startGameLoop(updateGame);
};



// Initialize the game
onMounted(() => {
  if (gameCanvas.value) {
    ctx = gameCanvas.value.getContext('2d');
    gameContainer.value.focus();
    
    // Load high score from local storage
    const savedHighScore = localStorage.getItem('pangHighScore');
    if (savedHighScore) {
      highScore.value = parseInt(savedHighScore, 10);
    }
  }
});

// Draw floating score texts
const drawFloatingTexts = (ctx) => {
  // Update and draw floating texts
  for (let i = floatingTexts.value.length - 1; i >= 0; i--) {
    const text = floatingTexts.value[i];
    
    // Update position
    text.x += text.velocity.x;
    text.y += text.velocity.y;
    
    // Update lifespan
    text.lifespan--;
    
    // Remove if expired
    if (text.lifespan <= 0) {
      floatingTexts.value.splice(i, 1);
      continue;
    }
    
    // Calculate opacity based on remaining lifespan
    const opacity = Math.min(text.lifespan / 30, 1);
    
    // Draw text
    ctx.font = '20px Arial';
    ctx.fillStyle = text.color || 'white';
    ctx.globalAlpha = opacity;
    ctx.textAlign = 'center';
    ctx.fillText(text.text, text.x, text.y);
    ctx.globalAlpha = 1;
  }
};

// Clean up when component is unmounted
onUnmounted(() => {
  stopGameLoop();
  if (comboTimeoutId.value) {
    clearTimeout(comboTimeoutId.value);
  }
  // Clean up global reference
  window.floatingTexts = null;
});
</script>

<style scoped>
.game-container {
  position: relative;
  width: 1024px;
  height: 768px;
  margin: 0 auto;
  background-color: #111;
  overflow: hidden;
  outline: none;
}

canvas {
  display: block;
  background-color: #1f2937;
}

.game-start, .game-over, .game-ui {
  position: absolute;
  color: white;
  text-align: center;
  z-index: 10;
}

.game-start, .game-over {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.game-modes {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

button {
  background-color: #4338ca;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3730a3;
}

.game-ui {
  top: 20px;
  right: 20px;
  text-align: right;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: sans-serif;
  z-index: 100;
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.score-display, .level-display, .difficulty-display {
  font-size: 24px;
  margin: 5px 0;
}

.combo-display {
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.combo-display.active {
  opacity: 1;
}

.combo-counter {
  font-size: 18px;
  color: #fcd34d;
}

.combo-multiplier {
  font-size: 16px;
  color: #f87171;
}

.high-score {
  margin-top: 15px;
  font-size: 20px;
  color: #FFD700;
}

button {
  padding: 12px 24px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #369d71;
}
</style>
