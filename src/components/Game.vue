<template>
  <div class="game-container" ref="gameContainer" tabindex="0">
    <!-- Power-Up Indicator UI -->
    <PowerUpIndicator v-if="gameRunning" />
    <GameCanvas
      :gameWidth="gameWidth"
      :gameHeight="gameHeight"
      :gameRunning="gameRunning"
      :onUpdate="updateGame"
      ref="gameCanvasRef"
    />
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
      :score="store.score"
      :highScore="highScore"
      @play-again="resetGame"
    />
    <GameScreen v-if="gameRunning"
      :score="store.score"
      :comboCounter="comboCounter"
      :comboMultiplier="comboMultiplier"
      :classicMode="classicMode"
      :currentLevel="currentLevel"
      :difficulty="difficulty"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import MainMenu from './screens/MainMenu.vue';
import StoreScreen from './screens/StoreScreen.vue';
import GameOverScreen from './screens/GameOverScreen.vue';
import GameScreen from './screens/GameScreen.vue';
import PowerUpIndicator from './PowerUpIndicator.vue';
import GameCanvas from './GameCanvas.vue';
import { useGameState } from './useGameState';
import { useGameLogic } from './useGameLogic';
import { useGameEngine } from './useGameEngine';
import { debounce, saveToLocalStorage, loadFromLocalStorage } from '../utils/helpers';

// State
const {
  gameWidth,
  gameHeight,
  gameContainer,
  showStore,
  gameRunning,
  classicMode,
  currentLevel,
  highScore,
  comboCounter,
  comboMultiplier,
  comboTimeoutId,
  difficulty,
  floatingTexts,
  debugMode,
  store
} = useGameState();

const gameCanvasRef = ref(null);

// Game engine systems (all-in-one)
const {
  keysPressed,
  startGameLoop,
  stopGameLoop,
  player,
  updatePlayer,
  drawPlayer,
  resetPlayer,
  bubbles,
  updateBubbles,
  drawBubbles,
  resetBubbles,
  initializeLevel,
  addRandomBubbles,
  projectiles,
  updateProjectiles,
  drawProjectiles,
  fireProjectile,
  resetProjectiles,
  gameOver,
  checkCollisions,
  resetGameState,
  onBubbleHit
} = useGameEngine(gameWidth, gameHeight);

// Game logic
const {
  resetCombo,
  increaseCombo,
  advanceToNextLevel,
  updateGame
} = useGameLogic({
  player,
  bubbles,
  projectiles,
  store,
  comboCounter,
  comboMultiplier,
  comboTimeoutId,
  gameOver,
  gameRunning,
  classicMode,
  currentLevel,
  highScore,
  floatingTexts,
  difficulty,
  resetPlayer,
  resetProjectiles,
  resetBubbles,
  resetGameState,
  initializeLevel,
  addRandomBubbles,
  fireProjectile,
  updatePlayer,
  updateBubbles,
  updateProjectiles,
  checkCollisions,
  drawBubbles,
  drawProjectiles,
  drawPlayer,
  drawFloatingTexts: () => {}, // Optionally pass if needed
  stopGameLoop,
  startGameLoop,
  saveToLocalStorage,
  loadFromLocalStorage,
  keysPressed
});

// Purchasing logic
const purchasePowerUp = (powerUpId) => {
  const success = store.purchasePowerUp(powerUpId);
  if (success) {
    // Immediate effect logic if needed
  }
};

// Store navigation
const closeStore = () => {
  showStore.value = false;
};

// Game control
const resetGame = () => {
  gameOver.value = false;
  resetGameState();
  currentLevel.value = 1;
  resetCombo();
  floatingTexts.value = [];
  window.floatingTexts = floatingTexts.value;
  difficulty.value = 1;
  if (gameContainer.value) {
    gameContainer.value.focus();
  }
};

const startGame = (classic = false) => {
  if (gameRunning.value) return;
  classicMode.value = classic;
  resetGame();
  resetPlayer();
  resetProjectiles();
  if (classic) {
    const config = [2, 0, 0];
    initializeLevel(config, [1, 1, 1]);
  } else {
    resetBubbles();
  }
  gameRunning.value = true;
  gameContainer.value.focus();
  startGameLoop(() => updateGame(gameCanvasRef.value?.gameCanvas?.getContext('2d')));
};

onMounted(() => {
  highScore.value = loadFromLocalStorage('pangHighScore', 0);
  // Register combo logic callback for bubble hits
  onBubbleHit(increaseCombo);
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
