import { ref } from 'vue';

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

  // Level config
  const levelConfigurations = [
    { bubbleCounts: [2, 0, 0], speeds: [1, 1, 1] },
    { bubbleCounts: [2, 2, 0], speeds: [1, 1, 1] },
    { bubbleCounts: [2, 2, 2], speeds: [1, 1, 1] },
    { bubbleCounts: [3, 2, 1], speeds: [1.1, 1.1, 1.1] },
    { bubbleCounts: [3, 3, 2], speeds: [1.2, 1.2, 1.2] },
    { bubbleCounts: [4, 3, 2], speeds: [1.3, 1.3, 1.3] },
  ];

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
