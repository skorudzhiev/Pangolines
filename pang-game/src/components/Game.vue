<template>
  <div class="game-container" ref="gameContainer" tabindex="0" @keydown="handleKeyDown" @keyup="handleKeyUp">
    <canvas ref="gameCanvas" :width="gameWidth" :height="gameHeight"></canvas>
    <div v-if="!gameRunning" class="game-start">
      <h1>Pang</h1>
      <button @click="startGame">Start Game</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameLoop } from '../composables/gameLoop';
import { usePlayer } from '../composables/player';
import { useBubbles } from '../composables/bubbles';
import { useProjectiles } from '../composables/projectiles';
import { useCollisions } from '../composables/collisions';

// Game properties
const gameWidth = 800;
const gameHeight = 600;
const gameContainer = ref(null);
const gameCanvas = ref(null);
const gameRunning = ref(false);
let ctx = null;

// Game state
const keysPressed = ref({
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
});

// Initialize game components
const { startGameLoop, stopGameLoop } = useGameLoop();
const { player, updatePlayer, drawPlayer, resetPlayer } = usePlayer(gameWidth, gameHeight);
const { bubbles, updateBubbles, drawBubbles, resetBubbles } = useBubbles(gameWidth, gameHeight);
const { projectiles, updateProjectiles, drawProjectiles, fireProjectile, resetProjectiles } = useProjectiles();
const { checkCollisions } = useCollisions(player, bubbles, projectiles);

// Handle keyboard input
const handleKeyDown = (e) => {
  if (e.code === 'ArrowLeft') keysPressed.value.ArrowLeft = true;
  if (e.code === 'ArrowRight') keysPressed.value.ArrowRight = true;
  if (e.code === 'Space') {
    keysPressed.value.Space = true;
    if (gameRunning.value) fireProjectile(player.value.x + player.value.width / 2, player.value.y);
  }
  e.preventDefault();
};

const handleKeyUp = (e) => {
  if (e.code === 'ArrowLeft') keysPressed.value.ArrowLeft = false;
  if (e.code === 'ArrowRight') keysPressed.value.ArrowRight = false;
  if (e.code === 'Space') keysPressed.value.Space = false;
  e.preventDefault();
};

// Game loop function
const updateGame = () => {
  if (!gameRunning.value) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, gameWidth, gameHeight);
  
  // Update player movement based on keys pressed
  updatePlayer(keysPressed.value);
  
  // Update projectiles
  updateProjectiles(gameHeight);
  
  // Update bubbles
  updateBubbles();
  
  // Check collisions
  checkCollisions();
  
  // Draw everything
  drawBubbles(ctx);
  drawProjectiles(ctx);
  drawPlayer(ctx);
};

// Start the game
const startGame = () => {
  if (gameRunning.value) return;
  
  resetPlayer();
  resetBubbles();
  resetProjectiles();
  
  gameRunning.value = true;
  gameContainer.value.focus();
  
  startGameLoop(updateGame);
};

// Initialize the game
onMounted(() => {
  if (gameCanvas.value) {
    ctx = gameCanvas.value.getContext('2d');
    gameContainer.value.focus();
  }
});

// Clean up when component is unmounted
onUnmounted(() => {
  stopGameLoop();
});
</script>

<style scoped>
.game-container {
  position: relative;
  width: 800px;
  height: 600px;
  margin: 0 auto;
  background-color: #111;
  overflow: hidden;
  outline: none;
}

canvas {
  display: block;
  background-color: #000;
}

.game-start {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
}

button {
  padding: 12px 24px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #369d71;
}
</style>
