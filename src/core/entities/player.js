import { ref } from 'vue';

export function usePlayer(gameWidth, gameHeight) {
  const player = ref({
    x: 0,
    y: 0,
    width: 40,
    height: 60,
    speed: 5,
    color: '#42b883'
  });
  
  const resetPlayer = () => {
    // Position the player at the bottom center of the screen
    player.value.x = (gameWidth - player.value.width) / 2;
    player.value.y = gameHeight - player.value.height - 10;
  };
  
  // Call reset to initialize player position
  resetPlayer();
  
  const updatePlayer = (keysPressed) => {
    // Move player left/right based on keys pressed
    if (keysPressed.ArrowLeft) {
      player.value.x = Math.max(0, player.value.x - player.value.speed);
    }
    if (keysPressed.ArrowRight) {
      player.value.x = Math.min(gameWidth - player.value.width, player.value.x + player.value.speed);
    }
  };
  
  const drawPlayer = (ctx) => {
    ctx.fillStyle = player.value.color;
    
    // Draw player body
    ctx.fillRect(
      player.value.x,
      player.value.y,
      player.value.width,
      player.value.height
    );
    
    // Draw player head (slightly rounded)
    ctx.beginPath();
    ctx.arc(
      player.value.x + player.value.width / 2,
      player.value.y,
      player.value.width / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };
  
  return {
    player,
    updatePlayer,
    drawPlayer,
    resetPlayer
  };
}
