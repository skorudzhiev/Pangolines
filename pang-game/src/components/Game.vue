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
      <div class="score-display">Score: {{ score.value }}</div>
      <div v-if="classicMode" class="level-display">Level: {{ currentLevel }}</div>
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
let ctx = null;

// Game state
const keysPressed = ref({
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
});

// Initialize game components
const { startGameLoop, stopGameLoop } = useGameLoop();
const { player, updatePlayer, drawPlayer, resetPlayer } = usePlayer(gameWidth, gameHeight);
const { bubbles, updateBubbles, drawBubbles, resetBubbles, initializeLevel } = useBubbles(gameWidth, gameHeight);
const { projectiles, updateProjectiles, drawProjectiles, fireProjectile, resetProjectiles } = useProjectiles();
const { score, gameOver, checkCollisions, resetGameState } = useCollisions(player, bubbles, projectiles);

// Handle keyboard input
const handleKeyDown = (e) => {
  if (e.code === 'ArrowLeft') keysPressed.value.ArrowLeft = true;
  if (e.code === 'ArrowRight') keysPressed.value.ArrowRight = true;
  if (e.code === 'Space') {
    keysPressed.value.Space = true;
    if (gameRunning.value) fireProjectile(player.value.x + player.value.width / 2, player.value.y);
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
  checkCollisions();
  
  // Draw everything
  drawBubbles(ctx);
  drawProjectiles(ctx);
  drawPlayer(ctx);
  
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
  
  // Check if level is completed (no bubbles left)
  if (classicMode.value && bubbles.value.length === 0) {
    advanceToNextLevel();
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

// Clean up when component is unmounted
onUnmounted(() => {
  stopGameLoop();
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
  background-color: #000;
}

.game-start, .game-over {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
}

.game-modes {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.game-ui {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  font-size: 18px;
  font-family: sans-serif;
}

.score-display {
  margin-bottom: 10px;
  font-size: 24px;
}

.level-display {
  font-size: 20px;
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
