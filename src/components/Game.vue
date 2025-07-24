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
      <PauseScreen
        v-if="showPauseScreen"
        @next-level="onNextLevel"
        @main-menu="onPauseMainMenu"
      />
    <SettingsScreen v-if="!gameRunning && !gameOver.value && showSettings"
      @toggle-particles="val => { showParticles.value = val; saveToLocalStorage('pangShowParticles', val); }"
      @back="showSettings = false"
    />
    </div>
  </div>
</template>

<script setup>
import styles from './Game.module.css';
import { levelConfigurations } from '../composables/useGameLogic';
import { onMounted, ref, watch } from 'vue';
import MainMenu from './screens/MainMenu/MainMenu.vue';
import StoreScreen from './screens/Store/StoreScreen.vue';
import GameOverScreen from './screens/GameOver/GameOverScreen.vue';
import GameScreen from './screens/GameScreen/GameScreen.vue';
import PauseScreen from './screens/PauseScreen/PauseScreen.vue';
import PowerUpIndicator from './PowerUpIndicator.vue';
import GameCanvas from './GameCanvas.vue';
import { useGameState } from '../composables/useGameState';
import { useGameLogic } from '../composables/useGameLogic';
import { useGameEngine } from '../composables/useGameEngine';
import useAudioManager from '../composables/useAudioManager';
import { debounce, saveToLocalStorage, loadFromLocalStorage } from '../utils/helpers';
import { useParticles } from '../composables/useParticles';
import { useComboFloatingText } from '../composables/useComboFloatingText';

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

// Settings: show/hide particles
const showParticles = ref(loadFromLocalStorage('pangShowParticles', true));

// Keep showParticles in sync with localStorage changes (e.g., from SettingsScreen)
window.addEventListener('storage', (event) => {
  if (event.key === 'pangShowParticles') {
    showParticles.value = event.newValue === 'true';
  }
});
watch(showParticles, (val) => {
  saveToLocalStorage('pangShowParticles', val);
});

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

// Combo floating text system
const { showComboText, drawFloatingTexts } = useComboFloatingText(floatingTexts);

// Game logic
const showPauseScreen = ref(false);
let pendingAdvance = false;

const {
  resetCombo,
  increaseCombo,
  advanceToNextLevel,
  updateGame: originalUpdateGame
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
  drawFloatingTexts,
  stopGameLoop,
  startGameLoop,
  saveToLocalStorage,
  loadFromLocalStorage,
  keysPressed
});

// Patch updateGame to handle pause between levels in classic mode
const updateGame = (ctx) => {
  if (!gameRunning.value || showPauseScreen.value) return;
  originalUpdateGame(ctx);
  // If classic mode and all bubbles cleared, show pause screen
  if (classicMode.value && bubbles.value.length === 0 && !showPauseScreen.value && !gameOver.value) {
    showPauseScreen.value = true;
    pendingAdvance = true;
    stopGameLoop();
  }
};

const onNextLevel = () => {
  showPauseScreen.value = false;
  if (pendingAdvance) {
    advanceToNextLevel();
    pendingAdvance = false;
    gameRunning.value = true;
    // Resume game loop exactly as in startGame
    startGameLoop(() => {
      const ctx = gameCanvasRef.value?.gameCanvas?.getContext('2d');
      if (!ctx) return;
      updateGame(ctx);
      if (showParticles.value) {
        updateParticles();
        drawParticles(ctx);
      }
    });
  }
};

const onPauseMainMenu = () => {
  showPauseScreen.value = false;
  gameRunning.value = false;
  resetGame();
};

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
  // Reset difficulty for arcade mode
  if (!classic) {
    difficulty.value = 1; // EXPLICITLY reset difficulty to 1
    resetBubbles();
    addRandomBubbles(1); // Force difficulty 1
  } else {
    // Use the first level configuration for classic mode
    initializeLevel(levelConfigurations[0].bubbleCounts, levelConfigurations[0].speeds);
  }
  // Play background music when game starts
  const { playMusic, musicEnabled, stopMusic } = useAudioManager();
  if (musicEnabled.value) {
    playMusic('/sounds/bgm.mp3');
  }
  // Watch for gameOver to stop music
  watch(gameOver, (val) => {
    if (val) {
      stopMusic();
    }
  });
  gameRunning.value = true;
  gameContainer.value.focus();
  startGameLoop(() => {
    const ctx = gameCanvasRef.value?.gameCanvas?.getContext('2d');
    if (!ctx) return;
    updateGame(ctx);
    if (showParticles.value) {
      updateParticles();
      drawParticles(ctx);
    }
  }); // updateGame is now the patched version with pause logic

};

onMounted(() => {
  highScore.value = loadFromLocalStorage('pangHighScore', 0);
  // Register combo logic callback for bubble hits
  onBubbleHit((bubble) => {
    increaseCombo();
    // Show floating combo multiplier above the popped bubble (non-intrusive, visually pleasing)
    if (bubble && comboMultiplier.value > 1) {
      showComboText({ x: bubble.x, y: bubble.y, multiplier: comboMultiplier.value });
    }
    // Optionally spawn particles (if enabled)
    if (showParticles.value && bubble) {
      spawnParticles({ x: bubble.x, y: bubble.y });
    }
  });
});
</script>



