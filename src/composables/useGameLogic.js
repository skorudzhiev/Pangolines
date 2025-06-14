import { ref } from 'vue';

// Level configurations for classic mode (example structure, adjust as needed)
export const levelConfigurations = [
  // Level 1: Only 1 Colossal bubble
  { bubbleCounts: [1, 0, 0, 0, 0, 0, 0], speeds: [0.8, 1, 1.2, 1.5, 2, 2.7, 3.5] },
  // Level 2: 1 Colossal, 1 Titanic
  { bubbleCounts: [1, 1, 0, 0, 0, 0, 0], speeds: [0.85, 1.05, 1.2, 1.5, 2, 2.7, 3.5] },
  // Level 3: 2 Titanic
  { bubbleCounts: [0, 2, 0, 0, 0, 0, 0], speeds: [0.9, 1.1, 1.25, 1.5, 2, 2.7, 3.5] },
  // Level 4: 1 Titanic, 1 Giant
  { bubbleCounts: [0, 1, 1, 0, 0, 0, 0], speeds: [0.9, 1.15, 1.3, 1.55, 2, 2.7, 3.5] },
  // Level 5: 1 Titanic, 2 Giant
  { bubbleCounts: [0, 1, 2, 0, 0, 0, 0], speeds: [0.95, 1.2, 1.35, 1.6, 2, 2.7, 3.5] },
  // Level 6: 2 Giant, 1 Large
  { bubbleCounts: [0, 0, 2, 1, 0, 0, 0], speeds: [1, 1.25, 1.4, 1.65, 2, 2.7, 3.5] },
  // Level 7: 1 Giant, 2 Large, 1 Medium
  { bubbleCounts: [0, 0, 1, 2, 1, 0, 0], speeds: [1, 1.3, 1.45, 1.7, 2.05, 2.7, 3.5] },
  // Level 8: 1 Giant, 2 Large, 2 Medium
  { bubbleCounts: [0, 0, 1, 2, 2, 0, 0], speeds: [1.05, 1.35, 1.5, 1.75, 2.1, 2.7, 3.5] },
  // Level 9: 2 Large, 2 Medium, 1 Small
  { bubbleCounts: [0, 0, 0, 2, 2, 1, 0], speeds: [1.1, 1.4, 1.55, 1.8, 2.15, 2.75, 3.5] },
  // Level 10: 1 Large, 2 Medium, 2 Small
  { bubbleCounts: [0, 0, 0, 1, 2, 2, 0], speeds: [1.15, 1.45, 1.6, 1.85, 2.2, 2.8, 3.5] },
  // Level 11: 1 Medium, 3 Small, 1 Tiny
  { bubbleCounts: [0, 0, 0, 0, 1, 3, 1], speeds: [1.2, 1.5, 1.65, 1.9, 2.25, 2.85, 3.6] },
  // Level 12: 2 Medium, 2 Small, 2 Tiny
  { bubbleCounts: [0, 0, 0, 0, 2, 2, 2], speeds: [1.25, 1.55, 1.7, 1.95, 2.3, 2.9, 3.7] },
  // Level 13: 1 Large, 2 Medium, 3 Small, 2 Tiny
  { bubbleCounts: [0, 0, 0, 1, 2, 3, 2], speeds: [1.3, 1.6, 1.75, 2, 2.35, 3, 3.8] },
  // Level 14: 1 Giant, 1 Large, 2 Medium, 3 Small, 3 Tiny
  { bubbleCounts: [0, 0, 1, 1, 2, 3, 3], speeds: [1.35, 1.7, 1.8, 2.05, 2.4, 3.1, 3.9] },
  // Level 15: 2 Large, 2 Medium, 4 Small, 4 Tiny (final challenge)
  { bubbleCounts: [0, 0, 0, 2, 2, 4, 4], speeds: [1.4, 1.8, 1.9, 2.1, 2.5, 3.2, 4] },
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
