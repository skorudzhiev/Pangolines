import { useGameLoop } from './managers/gameLoop';
import { usePlayer } from './entities/player';
import { useBubbles } from './entities/bubbles';
import { useProjectiles } from './systems/projectiles';
import { useCollisions } from './systems/collisions';
import { ref } from 'vue';

export function useGameEngine(canvasWidth, canvasHeight) {
  // Initialize game state
  const gameActive = ref(false);
  const level = ref(1);
  const keysPressed = ref({});
  
  // Initialize game components
  const { startGameLoop, stopGameLoop } = useGameLoop();
  const { player, updatePlayer, drawPlayer, resetPlayer } = usePlayer(canvasWidth, canvasHeight);
  const { bubbles, updateBubbles, drawBubbles, resetBubbles, initializeLevel, addRandomBubbles } = useBubbles(canvasWidth, canvasHeight);
  const { projectiles, fireProjectile, updateProjectiles, drawProjectiles, resetProjectiles } = useProjectiles();
  const { score, gameOver, checkCollisions, resetGameState } = useCollisions(player, bubbles, projectiles);

  // Handle keyboard input
  const handleKeyDown = (event) => {
    keysPressed.value[event.key] = true;
    
    // Fire projectile on spacebar
    if (event.key === ' ' && gameActive.value && !gameOver.value) {
      fireProjectile(player.value.x + player.value.width / 2, player.value.y);
    }
  };
  
  const handleKeyUp = (event) => {
    keysPressed.value[event.key] = false;
  };
  
  // Start listening for keyboard events
  const setupKeyboardListeners = () => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  };
  
  // Remove keyboard event listeners
  const removeKeyboardListeners = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
  
  // Main game update function
  const update = (ctx) => {
    if (!gameActive.value || gameOver.value) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Update game objects
    updatePlayer(keysPressed.value);
    updateBubbles();
    updateProjectiles(canvasHeight);
    checkCollisions();
    
    // Draw game objects
    drawPlayer(ctx);
    drawBubbles(ctx);
    drawProjectiles(ctx);
    
    // Check for level completion
    if (bubbles.value.length === 0) {
      levelComplete();
    }
  };
  
  // Start the game
  const startGame = (ctx) => {
    resetGame();
    gameActive.value = true;
    setupKeyboardListeners();
    startGameLoop(() => update(ctx));
  };
  
  // Stop the game
  const stopGame = () => {
    gameActive.value = false;
    stopGameLoop();
    removeKeyboardListeners();
  };
  
  // Reset the game state
  const resetGame = () => {
    resetPlayer();
    resetBubbles();
    resetProjectiles();
    resetGameState();
    level.value = 1;
  };
  
  // Handle level completion
  const levelComplete = () => {
    level.value++;
    // Add more bubbles or increase difficulty based on level
    const bubbleCounts = [2 + Math.min(level.value, 3), Math.floor(level.value / 2), Math.floor(level.value / 3)];
    const speeds = [1 + level.value * 0.1, 1 + level.value * 0.15, 1 + level.value * 0.2];
    initializeLevel(bubbleCounts, speeds);
  };
  
  return {
    player,
    bubbles,
    projectiles,
    score,
    gameOver,
    level,
    gameActive,
    startGame,
    stopGame,
    resetGame
  };
}
