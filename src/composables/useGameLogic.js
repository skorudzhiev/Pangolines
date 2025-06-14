import { ref } from 'vue';

// Level configurations for classic mode (example structure, adjust as needed)
export const levelConfigurations = [
  // Level 1: Only 1 Medium bubble, slow
  { bubbleCounts: [0, 0, 0, 0, 1, 0, 0], speeds: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8] },
  // Level 2: 2 Medium, still slow
  { bubbleCounts: [0, 0, 0, 0, 2, 0, 0], speeds: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8] },
  // Level 3: 1 Medium, 1 Small
  { bubbleCounts: [0, 0, 0, 1, 1, 1, 0], speeds: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8] },
  // Level 4: 2 Small, slow
  { bubbleCounts: [0, 0, 1, 0, 1, 0, 0], speeds: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9] },
  // Level 5: 1 Small, 1 Tiny
  { bubbleCounts: [0, 0, 0, 2, 2, 1, 0], speeds: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9] },
  // Level 6: 2 Giant
  { bubbleCounts: [0, 0, 2, 0, 0, 0, 0], speeds: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0] },
  // Level 7: 1 Titanic
  { bubbleCounts: [0, 1, 0, 0, 0, 0, 0], speeds: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0] },
  // Level 8: 2 Titanic
  { bubbleCounts: [0, 2, 0, 0, 0, 0, 0], speeds: [1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1] },
  // Level 9: 1 Colossal
  { bubbleCounts: [1, 0, 0, 0, 0, 0, 0], speeds: [1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2] },
  // Level 10: 2 Medium, 2 Small, 2 Tiny
  { bubbleCounts: [0, 0, 0, 0, 2, 2, 2], speeds: [1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3] },
  // Level 11: 1 Giant, 1 Medium, 2 Small, 2 Tiny
  { bubbleCounts: [0, 0, 1, 1, 2, 2, 2], speeds: [1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4] },
  // Level 12: 1 Large, 2 Medium, 2 Small, 2 Tiny
  { bubbleCounts: [0, 0, 1, 2, 2, 2, 2], speeds: [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5] },
  // Level 13: 1 Large, 1 Medium, 2 Small, 3 Tiny
  { bubbleCounts: [0, 0, 1, 1, 2, 2, 2], speeds: [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6] },
  // Level 14: 2 Large, 2 Medium, 3 Small, 3 Tiny
  { bubbleCounts: [0, 0, 2, 2, 3, 3, 3], speeds: [1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7] },
  // Level 15: 2 Large, 2 Medium, 4 Small, 4 Tiny (final challenge)
  { bubbleCounts: [0, 0, 2, 2, 4, 4, 4], speeds: [1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8] },
];

export function useGameLogic({
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
}) {
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


  const advanceToNextLevel = () => {
    currentLevel.value++;
    const levelIndex = Math.min(currentLevel.value - 1, levelConfigurations.length - 1);
    const config = levelConfigurations[levelIndex];
    initializeLevel(config.bubbleCounts, config.speeds);
  };

  // Game update logic
  let lastFireTime = 0;
  const fireCooldown = 300;

  const updateGame = (ctx) => {
    if (!gameRunning.value) return;

    ctx.clearRect(0, 0, 1024, 768);
    updatePlayer({
      ArrowLeft: keysPressed.ArrowLeft,
      ArrowRight: keysPressed.ArrowRight,
      Space: keysPressed.Space
    });
    if (keysPressed.Space && Date.now() - lastFireTime > fireCooldown) {
      fireProjectile(player.value.x + player.value.width / 2, player.value.y);
      lastFireTime = Date.now();
    }
    updateProjectiles(768);
    updateBubbles();
    checkCollisions(comboMultiplier.value);
    drawBubbles(ctx);
    drawProjectiles(ctx);
    drawPlayer(ctx);
    drawFloatingTexts(ctx);
    if (gameOver.value) {
      gameRunning.value = false;
      stopGameLoop();
      resetProjectiles();
      store.resetPowerUps();
      if (store.score > highScore.value) {
        highScore.value = store.score;
        saveToLocalStorage('pangHighScore', highScore.value);
      }
    }

    if (!classicMode.value && bubbles.value.length === 0) {
      // IMPROVEMENT: Increase difficulty increment for faster progression
      difficulty.value += 1.0; // Whole number increments for more distinct difficulty changes
      console.log('Arcade mode: advancing to difficulty level', difficulty.value);
      resetBubbles();
      addRandomBubbles(Math.floor(difficulty.value)); // Use integer difficulty levels
    }
  };

  return {
    resetCombo,
    increaseCombo,
    advanceToNextLevel,
    updateGame,
  };
}
