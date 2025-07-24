import { usePlayer } from '../core/entities/player';
import { useBubbles } from '../core/entities/bubbles';
import { useProjectiles } from '../core/systems/projectiles';
import { useCollisions } from '../core/systems/collisions';
import { useGameLoop } from '../core/managers/gameLoop';
import { useInput } from '../composables/useInput';
import { debugMode, processDebugInput } from '../composables/useDebugMode';

export function useGameEngine(gameWidth, gameHeight) {
  // Input system
  const { keysPressed, inputBuffer } = useInput();
  
  // Debug mode system handled via direct imports
  
  // Process debug input from buffer
  const processInput = () => {
    processDebugInput(inputBuffer);
  };

  // Game engine systems
  const { startGameLoop, stopGameLoop } = useGameLoop();
  const { player, updatePlayer, drawPlayer, resetPlayer } = usePlayer(gameWidth, gameHeight);
  const { bubbles, updateBubbles, drawBubbles, resetBubbles, initializeLevel, addRandomBubbles } = useBubbles(gameWidth, gameHeight);
  const { projectiles, updateProjectiles, drawProjectiles, fireProjectile, resetProjectiles } = useProjectiles();
  const { gameOver, checkCollisions, resetGameState, onBubbleHit } = useCollisions(player, bubbles, projectiles);

  return {
    keysPressed,
    processInput,
    debugMode,
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
  };
}
