import { ref } from 'vue';
import store from '../store.js';

export function useGameState() {
  const gameWidth = 1024;
  const gameHeight = 768;
  const gameContainer = ref(null);
  const gameCanvas = ref(null);
  const canvasWrapper = ref(null);
  const showStore = ref(false);
  const gameRunning = ref(false);
  const classicMode = ref(false);
  const currentLevel = ref(1);
  const highScore = ref(0);
  const comboCounter = ref(0);
  const comboMultiplier = ref(1);
  const comboTimeoutId = ref(null);
  const difficulty = ref(1);
  const floatingTexts = ref([]);
  const debugMode = ref(false);

  return {
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
    debugMode,
    store
  };
}
