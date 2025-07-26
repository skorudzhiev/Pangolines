<template>
  <div :class="styles.gameContainer" ref="gameContainer" tabindex="0">
    <!-- Debug Mode Indicator -->
    <div v-if="debugIndicator.visible" :style="debugIndicator.style">
      {{ debugIndicator.text }}
    </div>
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
        :powerUps="store.powerUps"
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
        :timeState="timeState"
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
import { onMounted, onUnmounted, ref, watch } from 'vue';
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
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/helpers.js';
import { useParticles } from '../composables/useParticles';
import { debugMode, processDebugInput, getDebugIndicator, toggleDebugMode, isDebugAvailable } from '../composables/useDebugMode.js';
import { useComboFloatingText } from '../composables/useComboFloatingText';
import useAudioManager from '../composables/useAudioManager';

// State
const {
  gameWidth,
  gameHeight,
  gameContainer,
  gameCanvas,
  canvasWrapper,
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
  store
} = useGameState();

const debugIndicator = ref(getDebugIndicator());

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

// Watch for debug mode changes and update indicator
watch(debugMode, () => {
  debugIndicator.value = getDebugIndicator();
}, { immediate: true });

// --- GLOBAL DEBUG TOGGLE HANDLER ---
onMounted(() => {
  const globalDebugKeyHandler = (e) => {
    if (e.code === 'KeyD') {
      toggleDebugMode(); // Directly toggle debug mode globally
    }
  };
  window.addEventListener('keydown', globalDebugKeyHandler);

  // Clean up
  onUnmounted(() => {
    window.removeEventListener('keydown', globalDebugKeyHandler);
  });
});

// Game engine systems (all-in-one)
const {
  keysPressed,
  processInput,
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
  onBubbleHit,
  timeState
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
  timeState,
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
  
  // Process debug input
  processInput();
  
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

  // --- BUGFIX: Ensure at least one bubble is present ---
  if (bubbles.value.length === 0) {
    // Try to add a default Medium bubble in the center
    if (typeof createBubble === 'function') {
      bubbles.value.push(createBubble(gameWidth / 2, 120, 4));
      console.warn('[BUGFIX] No bubbles present after game start. Added a fallback Medium bubble. Check your level/bubble configs!');
    } else {
      // Fallback: push a minimal bubble object
      bubbles.value.push({ x: gameWidth / 2, y: 120, radius: 40, color: '#ff7e67', velocityX: 2, velocityY: -6, gravity: 0.02, size: 4, points: 4, minBounceVelocity: 3 });
      console.warn('[BUGFIX] No bubbles present and createBubble missing. Added a minimal fallback bubble.');
    }
  }
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



