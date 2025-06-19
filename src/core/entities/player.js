import { ref, watch } from 'vue';
import store from '../../store.js';

export function usePlayer(gameWidth, gameHeight) {
  const player = ref({
    x: 0,
    y: 0,
    width: 40,
    height: 60,
    speed: 5,
    color: '#42b883'
  });
  
  // Watch for 'Faster Movement' power-up and update speed
  function updateSpeedFromPowerUp() {
    const faster = store.powerUps.find(p => p.id === 'fasterMovement' && p.isPurchased);
    player.value.speed = faster ? 8 : 5;
  }
  updateSpeedFromPowerUp();
  
  // Reactively update speed if power-up is bought
  watch(
    () => store.powerUps.find(p => p.id === 'fasterMovement')?.isPurchased,
    () => updateSpeedFromPowerUp(),
    { immediate: true }
  );

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
  
  const drawPlayer = (ctx, debugMode = false) => {
    const { x, y, width, height, color } = player.value;
    // Body: rounded rectangle
    ctx.save();
    ctx.fillStyle = color;
    const bodyRadius = 10;
    ctx.beginPath();
    ctx.moveTo(x + bodyRadius, y + height * 0.25);
    ctx.lineTo(x + width - bodyRadius, y + height * 0.25);
    ctx.quadraticCurveTo(x + width, y + height * 0.25, x + width, y + height * 0.25 + bodyRadius);
    ctx.lineTo(x + width, y + height - bodyRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - bodyRadius, y + height);
    ctx.lineTo(x + bodyRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - bodyRadius);
    ctx.lineTo(x, y + height * 0.25 + bodyRadius);
    ctx.quadraticCurveTo(x, y + height * 0.25, x + bodyRadius, y + height * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Head: circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + width / 2, y + width / 2.5, width / 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe066'; // Head color
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();

    // Face: eyes and smile
    ctx.save();
    ctx.fillStyle = '#222';
    // Eyes
    const eyeY = y + width / 2.5 - width / 7;
    ctx.beginPath();
    ctx.arc(x + width / 2 - width / 7, eyeY, width / 18, 0, Math.PI * 2);
    ctx.arc(x + width / 2 + width / 7, eyeY, width / 18, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.arc(x + width / 2, y + width / 2.5 + width / 12, width / 8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.restore();

    // Arms
    ctx.save();
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    // Left arm
    ctx.beginPath();
    ctx.moveTo(x + width * 0.08, y + height * 0.38);
    ctx.lineTo(x - width * 0.18, y + height * 0.55);
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(x + width * 0.92, y + height * 0.38);
    ctx.lineTo(x + width * 1.18, y + height * 0.55);
    ctx.stroke();
    ctx.restore();

    // Legs
    ctx.save();
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    // Left leg
    ctx.beginPath();
    ctx.moveTo(x + width * 0.32, y + height);
    ctx.lineTo(x + width * 0.18, y + height + height * 0.22);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(x + width * 0.68, y + height);
    ctx.lineTo(x + width * 0.82, y + height + height * 0.22);
    ctx.stroke();
    ctx.restore();

    // Debug: draw hitboxes
    if (debugMode) {
      ctx.save();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      // Rectangle hitbox
      ctx.strokeRect(x, y, width, height);
      // Head hitbox
      ctx.beginPath();
      ctx.arc(x + width / 2, y + width / 2.5, width / 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };
  
  return {
    player,
    updatePlayer,
    drawPlayer,
    resetPlayer
  };
}
