<template>
  <div class="game-container" ref="gameContainer" tabindex="0" @resize="handleResize">
    <div class="canvas-wrapper" ref="canvasWrapper">
      <canvas ref="gameCanvas" :width="gameWidth" :height="gameHeight"></canvas>
    </div>
    
    <MainMenu v-if="!gameRunning && !gameOver.value && !showStore"
      :highScore="highScore"
      @start-game="startGame"
      @show-store="showStore = true"
    />

    <StoreScreen v-if="!gameRunning && !gameOver.value && showStore"
      :score="store.score"
      :powerUps="store.powerUps"
      @purchase="purchasePowerUp"
      @close-store="closeStore"
    />

    <GameOverScreen v-if="gameOver.value"
      :score="score.value"
      :highScore="highScore"
      @play-again="resetGame"
    />

    <GameScreen v-if="gameRunning"
      :score="score.value"
      :comboCounter="comboCounter"
      :comboMultiplier="comboMultiplier"
      :classicMode="classicMode"
      :currentLevel="currentLevel"
      :difficulty="difficulty"
    />
  </div>
</template>

<script setup>
// Optional: define a component name for dev tools
defineOptions({ 
  name: 'Game'
});

// Imports
import { ref, onMounted, onUnmounted } from 'vue';
import { useInput } from '../composables/useInput';
import store from '../store.js';
import { debounce, clamp, saveToLocalStorage, loadFromLocalStorage } from '../utils/helpers';

import MainMenu from './screens/MainMenu.vue';
import StoreScreen from './screens/StoreScreen.vue';
import GameOverScreen from './screens/GameOverScreen.vue';
import GameScreen from './screens/GameScreen.vue';

import { useGameEngine } from '../core/GameEngine';
import { useGameLoop } from '../core/managers/gameLoop';
import { usePlayer } from '../core/entities/player';
import { useBubbles } from '../core/entities/bubbles';
import { useProjectiles } from '../core/systems/projectiles';
import { useCollisions } from '../core/systems/collisions';

// Reactive refs and game states
const gameWidth = 1024; // Base game width
const gameHeight = 768; // Base game height
const gameContainer = ref(null);
const gameCanvas = ref(null);
const canvasWrapper = ref(null);
const showStore = ref(false); // <-- controls whether the store overlay is shown

const gameRunning = ref(false);
const classicMode = ref(false);
const currentLevel = ref(1);
const highScore = ref(0);
const comboCounter = ref(0);
const comboMultiplier = ref(1);
const comboTimeoutId = ref(null);

let ctx = null;
const difficulty = ref(1);

// For floating text animations
const floatingTexts = ref([]);
window.floatingTexts = floatingTexts.value;

// Input system
const { keysPressed } = useInput();

// Debug mode
const debugMode = ref(false);
// Toggle debug mode with 'D' key
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyD') debugMode.value = !debugMode.value;
});

// Initialize game systems
const { startGameLoop, stopGameLoop } = useGameLoop();
const { player, updatePlayer, drawPlayer, resetPlayer } = usePlayer(gameWidth, gameHeight);
const { bubbles, updateBubbles, drawBubbles, resetBubbles, initializeLevel, addRandomBubbles } = useBubbles(gameWidth, gameHeight);
const { projectiles, updateProjectiles, drawProjectiles, fireProjectile, resetProjectiles } = useProjectiles();
const { score, gameOver, checkCollisions, resetGameState, onBubbleHit } = useCollisions(player, bubbles, projectiles);

// Purchasing logic
const purchasePowerUp = (powerUpId) => {
  const success = store.purchasePowerUp(powerUpId);
  if (success) {
    console.log(`Purchased ${powerUpId}`);
    // If the purchased power-up requires an immediate effect, you can check here or in your game loop.
  }
};

// Store navigation
const closeStore = () => {
  showStore.value = false;
};

// Combo system
const resetCombo = () => {
  comboCounter.value = 0;
  comboMultiplier.value = 1;
};

const increaseCombo = () => {
  if (comboTimeoutId.value) {
    clearTimeout(comboTimeoutId.value);
  }
  comboCounter.value++;
  comboMultiplier.value = 1 + Math.floor(comboCounter.value / 3) * 0.5;
  comboTimeoutId.value = setTimeout(() => {
    resetCombo();
  }, 3000);
};

onBubbleHit(() => {
  increaseCombo();
});

// Input handling is now managed by useInput composable.
// To fire projectiles, handle this in the game loop or with inputBuffer in the composable, if needed.

// Core game loop update
// Firing cooldown (in ms)
let lastFireTime = 0;
const fireCooldown = 300; // 300ms between shots

const updateGame = () => {
  if (!gameRunning.value) return;

  ctx.clearRect(0, 0, gameWidth, gameHeight);

  // Movement
  updatePlayer({
    ArrowLeft: keysPressed.ArrowLeft,
    ArrowRight: keysPressed.ArrowRight,
    Space: keysPressed.Space
  });

  // Fire projectile if Space is pressed and cooldown allows
  if (keysPressed.Space && Date.now() - lastFireTime > fireCooldown) {
    fireProjectile(player.value.x + player.value.width / 2, player.value.y);
    lastFireTime = Date.now();
  }

  // Projectiles
  updateProjectiles(gameHeight);

  // Bubbles
  updateBubbles();

  // Collisions
  checkCollisions(comboMultiplier.value);

  // Drawing
  drawBubbles(ctx, debugMode.value);
  drawProjectiles(ctx, debugMode.value);
  drawPlayer(ctx, debugMode.value);
  drawFloatingTexts(ctx);

  // Check for game over
  if (gameOver.value) {
    console.log('Game over detected:', gameOver.value);
    gameRunning.value = false;
    stopGameLoop();
    if (score.value > highScore.value) {
      highScore.value = score.value;
      saveToLocalStorage('pangHighScore', highScore.value);
    }
  }

  // Classic mode progression
  if (classicMode.value && bubbles.value.length === 0) {
    advanceToNextLevel();
  }

  // Arcade mode dynamic bubble spawn
  if (!classicMode.value && bubbles.value.length < 3 && Math.random() < 0.02) {
    difficulty.value += 0.05;
    addRandomBubbles(Math.min(Math.floor(difficulty.value), 3), difficulty.value);
  }
};

// Level config
const levelConfigurations = [
  { bubbleCounts: [2, 0, 0], speeds: [1, 1, 1] },
  { bubbleCounts: [2, 2, 0], speeds: [1, 1, 1] },
  { bubbleCounts: [2, 2, 2], speeds: [1, 1, 1] },
  { bubbleCounts: [3, 2, 1], speeds: [1.1, 1.1, 1.1] },
  { bubbleCounts: [3, 3, 2], speeds: [1.2, 1.2, 1.2] },
  { bubbleCounts: [4, 3, 2], speeds: [1.3, 1.3, 1.3] },
];

// Move to next level in classic mode
const advanceToNextLevel = () => {
  currentLevel.value++;
  const levelIndex = Math.min(currentLevel.value - 1, levelConfigurations.length - 1);
  const config = levelConfigurations[levelIndex];
  initializeLevel(config.bubbleCounts, config.speeds);
};

// Reset entire game
const resetGame = () => {
  gameOver.value = false;
  resetGameState();
  currentLevel.value = 1;
  resetCombo();
  floatingTexts.value = [];
  window.floatingTexts = floatingTexts.value;
  difficulty.value = 1;

  // If you want to reset power-ups each run:
  // store.resetPowerUps();

  if (gameContainer.value) {
    gameContainer.value.focus();
  }
};

// Start the game
const startGame = (classic = false) => {
  if (gameRunning.value) return;

  classicMode.value = classic;
  resetGame();
  resetPlayer();
  resetProjectiles();

  if (classic) {
    const config = levelConfigurations[0];
    initializeLevel(config.bubbleCounts, config.speeds);
  } else {
    resetBubbles();
  }

  gameRunning.value = true;
  gameContainer.value.focus();
  startGameLoop(updateGame);
};

// Floating text drawing
const drawFloatingTexts = (ctx) => {
  for (let i = floatingTexts.value.length - 1; i >= 0; i--) {
    const text = floatingTexts.value[i];
    text.x += text.velocity.x;
    text.y += text.velocity.y;
    text.lifespan--;

    if (text.lifespan <= 0) {
      floatingTexts.value.splice(i, 1);
      continue;
    }

    const opacity = Math.min(text.lifespan / 30, 1);
    ctx.font = '20px Arial';
    ctx.fillStyle = text.color || 'white';
    ctx.globalAlpha = opacity;
    ctx.textAlign = 'center';
    ctx.fillText(text.text, text.x, text.y);
    ctx.globalAlpha = 1;
  }
};

// Handle canvas scaling
const updateCanvasScale = () => {
  if (!gameContainer.value || !canvasWrapper.value) return;
  
  const container = gameContainer.value.getBoundingClientRect();
  
  // Calculate the scale to fit the game in the container
  const scaleToFit = Math.min(
    container.width / gameWidth,
    container.height / gameHeight
  ) * 0.95; // 95% of available space to ensure some padding
  
  // Calculate the new dimensions
  const newWidth = gameWidth * scaleToFit;
  const newHeight = gameHeight * scaleToFit;
  
  // Calculate the position to center the game
  const left = (container.width - newWidth) / 2;
  const top = (container.height - newHeight) / 2;
  
  // Apply the scaling and positioning
  Object.assign(canvasWrapper.value.style, {
    transform: `scale(${scaleToFit})`,
    transformOrigin: 'top left',
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: `${gameWidth}px`,
    height: `${gameHeight}px`
  });
};

const handleResize = () => {
  updateCanvasScale();
  // Ensure the canvas is properly cleared and redrawn on resize
  if (ctx) {
    ctx.clearRect(0, 0, gameWidth, gameHeight);
  }
};

onMounted(() => {
  if (gameCanvas.value) {
    ctx = gameCanvas.value.getContext('2d');
    gameContainer.value.focus();
    highScore.value = loadFromLocalStorage('pangHighScore', 0);
    // Initial scale update
    updateCanvasScale();
    // Add resize listener with debounce
    const handleResizeWithDebounce = debounce(handleResize, 150);
    window.addEventListener('resize', handleResizeWithDebounce);
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResizeWithDebounce);
    };
  }
});

onUnmounted(() => {
  stopGameLoop();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.floatingTexts = null;
});
</script>

<style scoped>
.game-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #111;
  overflow: hidden;
  outline: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.canvas-wrapper {
  position: relative;
  width: 1024px;
  height: 768px;
  transform-origin: center center;
  will-change: transform;
  flex-shrink: 0;
}

canvas {
  display: block;
  background-color: #1f2937;
  width: 100%;
  height: 100%;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* Main menu & game over overlays share styling */
.game-start, .game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: white;
  z-index: 20;
}

/* The separate store overlay */
.store-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #111;
  border: 1px solid #444;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  color: white;
  text-align: center;
  z-index: 30; /* on top of the main menu */
}

/* Shared class for scoreboard, etc. */
.score-display {
  font-size: 20px;
  margin-bottom: 10px;
}

/* Power-up list styles */
.powerups-container {
  margin-top: 20px;
  text-align: left;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  width: 100%;
}

.powerup-item {
  margin-bottom: 15px;
}

/* Buttons */
.game-modes, .powerups-container {
  display: flex;
  flex-direction: column;
  align-items: center;
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

.back-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4b5563;
}

.back-button:hover {
  background-color: #374151;
}

/* High score styling */
.high-score {
  margin-top: 15px;
  font-size: 20px;
  color: #FFD700;
}

/* In-game UI overlay */
.game-ui {
  position: absolute;
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
</style>
