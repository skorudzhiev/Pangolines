import { ref } from 'vue';

// Level configurations for classic mode (example structure, adjust as needed)
export const levelConfigurations = [
  // Level 1: Only 1 Colossal bubble, slow
  { bubbleCounts: [1, 0, 0, 0, 0, 0, 0], speeds: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2] },
  // Level 2: 2 Colossal, still slow
  { bubbleCounts: [2, 0, 0, 0, 0, 0, 0], speeds: [1.05, 1.25, 1.45, 1.65, 1.85, 2.05, 2.25] },
  // Level 3: 1 Colossal, 1 Titanic
  { bubbleCounts: [1, 1, 0, 0, 0, 0, 0], speeds: [1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3] },
  // Level 4: 2 Titanic, slow
  { bubbleCounts: [0, 2, 0, 0, 0, 0, 0], speeds: [1.15, 1.35, 1.55, 1.75, 1.95, 2.15, 2.35] },
  // Level 5: 1 Titanic, 1 Giant
  { bubbleCounts: [0, 1, 1, 0, 0, 0, 0], speeds: [1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4] },
  // Level 6: 2 Giant, slow
  { bubbleCounts: [0, 0, 2, 0, 0, 0, 0], speeds: [1.25, 1.45, 1.65, 1.85, 2.05, 2.25, 2.45] },
  // Level 7: 1 Giant, 1 Large
  { bubbleCounts: [0, 0, 1, 1, 0, 0, 0], speeds: [1.3, 1.5, 1.7, 1.9, 2.1, 2.3, 2.5] },
  // Level 8: 1 Giant, 2 Large
  { bubbleCounts: [0, 0, 1, 2, 0, 0, 0], speeds: [1.35, 1.55, 1.75, 1.95, 2.15, 2.35, 2.55] },
  // Level 9: 2 Large, 1 Medium
  { bubbleCounts: [0, 0, 0, 2, 1, 0, 0], speeds: [1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6] },
  // Level 10: 1 Large, 2 Medium
  { bubbleCounts: [0, 0, 0, 1, 2, 0, 0], speeds: [1.45, 1.65, 1.85, 2.05, 2.25, 2.45, 2.65] },
  // Level 11: 1 Medium, 2 Small
  { bubbleCounts: [0, 0, 0, 0, 1, 2, 0], speeds: [1.5, 1.7, 1.9, 2.1, 2.3, 2.5, 2.7] },
  // Level 12: 1 Medium, 1 Small, 1 Tiny
  { bubbleCounts: [0, 0, 0, 0, 1, 1, 1], speeds: [1.55, 1.75, 1.95, 2.15, 2.35, 2.55, 2.75] },
  // Level 13: 2 Small, 2 Tiny
  { bubbleCounts: [0, 0, 0, 0, 0, 2, 2], speeds: [1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8] },
  // Level 14: 1 Large, 1 Medium, 2 Small, 2 Tiny
  { bubbleCounts: [0, 0, 0, 1, 1, 2, 2], speeds: [1.7, 1.9, 2.1, 2.3, 2.5, 2.7, 2.9] },
  // Level 15: 2 Medium, 3 Small, 3 Tiny (final challenge)
  { bubbleCounts: [0, 0, 0, 0, 2, 3, 3], speeds: [1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0] },
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
    // if (classicMode.value && bubbles.value.length === 0) {
    //   advanceToNextLevel();
    // }
    if (!classicMode.value && bubbles.value.length < 3 && Math.random() < 0.02) {
      difficulty.value += 0.05;
      addRandomBubbles(Math.min(Math.floor(difficulty.value), 3), difficulty.value);
    }
  };

  return {
    resetCombo,
    increaseCombo,
    advanceToNextLevel,
    updateGame,
  };
}
