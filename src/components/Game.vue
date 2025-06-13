<template>
  <div :class="styles.gameContainer" ref="gameContainer" tabindex="0">
    <div :class="styles.canvasWrapper">
      <GameCanvas
        :gameWidth="gameWidth"
        :gameHeight="gameHeight"
        :gameRunning="gameRunning"
        :onUpdate="updateGame"
        ref="gameCanvasRef"
      />
      <!-- Overlays positioned over the canvas -->
      <PowerUpIndicator v-if="gameRunning" />
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
        :class="styles.storeContainer"
      />
      <GameOverScreen v-if="gameOver.value"
        :score="store.score"
        :highScore="highScore"
        @play-again="resetGame"
        :class="styles.gameStart"
      />
      <GameScreen v-if="gameRunning"
        :score="store.score"
        :comboCounter="comboCounter"
        :comboMultiplier="comboMultiplier"
        :classicMode="classicMode"
      :currentLevel="currentLevel"
      :difficulty="difficulty"
      :class="styles.gameUi"
    />
    </div>
  </div>
</template>

<script setup>
import styles from './Game.module.css';
import { onMounted, ref } from 'vue';
import MainMenu from './screens/MainMenu/MainMenu.vue';
import StoreScreen from './screens/Store/StoreScreen.vue';
import GameOverScreen from './screens/GameOver/GameOverScreen.vue';
import GameScreen from './screens/GameScreen/GameScreen.vue';
import PowerUpIndicator from './PowerUpIndicator.vue';
import GameCanvas from './GameCanvas.vue';
import { useGameState } from '../composables/useGameState';
import { useGameLogic } from '../composables/useGameLogic';
import { useGameEngine } from '../composables/useGameEngine';
import { debounce, saveToLocalStorage, loadFromLocalStorage } from '../utils/helpers';
import { useParticles } from '../composables/useParticles';

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

// Particle system
const { spawnParticles, updateParticles, drawParticles } = useParticles();

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
  gameOver.value = false; // Ensure gameOver is reset before starting
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
  startGameLoop(() => {
    const ctx = gameCanvasRef.value?.gameCanvas?.getContext('2d');
    if (!ctx) return;
    updateGame(ctx);
    updateParticles();
    drawParticles(ctx);
  });
};

onMounted(() => {
  highScore.value = loadFromLocalStorage('pangHighScore', 0);
  // Register combo logic callback for bubble hits
  onBubbleHit((...args) => {
    increaseCombo(...args);
    // Find bubble position for particle spawn
    // Use last floatingText as proxy for bubble position
    if (window.floatingTexts && window.floatingTexts.length > 0) {
      const lastText = window.floatingTexts[window.floatingTexts.length - 1];
      spawnParticles({ x: lastText.x, y: lastText.y });
    }
  });
});
</script>



