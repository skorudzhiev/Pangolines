import { ref, watch, onMounted, onUnmounted } from 'vue';
import store from '../../store.js';

export function usePlayer(gameWidth, gameHeight) {
  const player = ref({
    x: 0,
    y: 0,
    width: 40,
    height: 60,
    speed: 5,
    color: '#42b883',
    shieldActive: false,
    shieldDuration: 0,
    lives: 3
  });
  
  // Time manipulation state
  const timeState = ref({
    slowTimeActive: false,
    slowTimeDuration: 0,
    timeMultiplier: 1.0
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
  
  // Power-up activation functions
  const activateShield = () => {
    const hasShield = store.powerUps.find(p => p.id === 'shield' && p.isPurchased);
    if (hasShield && !player.value.shieldActive) {
      player.value.shieldActive = true;
      player.value.shieldDuration = 300; // 5 seconds at 60fps
      if (hasShield) hasShield.isPurchased = false; // Consume shield
      if (typeof window !== 'undefined') {
        const audio = new Audio('/audio/shield_activate.mp3');
        audio.volume = 0.5;
        audio.play();
      }
    }
  };
  
  const activateSlowTime = () => {
    const hasSlowTime = store.powerUps.find(p => p.id === 'slowTime' && p.isPurchased);
    if (hasSlowTime && !timeState.value.slowTimeActive) {
      timeState.value.slowTimeActive = true;
      timeState.value.slowTimeDuration = 600; // 10 seconds at 60fps
      timeState.value.timeMultiplier = 0.5; // Half speed
    }
  };
  
  const checkExtraLife = () => {
    const hasExtraLife = store.powerUps.find(p => p.id === 'extraLife' && p.isPurchased);
    if (hasExtraLife && player.value.lives === 3) {
      player.value.lives = 4; // Grant extra life
    }
  };
  
  // Initialize extra life if purchased
  checkExtraLife();

  // Direct keyboard event listener for power-up activation
  const handleKeyDown = (e) => {
    if (e.code === 'KeyS') {
      activateShield();
    } else if (e.code === 'KeyT') {
      activateSlowTime();
    }
  };

  // Set up keyboard listener when component mounts
  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
    }
  });

  // Clean up listener when component unmounts
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
    }
  });
  
  const updatePlayer = (keysPressed, timeMultiplier = 1.0) => {
    // Update power-up timers
    if (player.value.shieldActive) {
      player.value.shieldDuration--;
      if (player.value.shieldDuration <= 0) {
        player.value.shieldActive = false;
        player.value.shieldDuration = 0;
      }
    }
    
    if (timeState.value.slowTimeActive) {
      timeState.value.slowTimeDuration--;
      if (timeState.value.slowTimeDuration <= 0) {
        timeState.value.slowTimeActive = false;
        timeState.value.slowTimeDuration = 0;
        timeState.value.timeMultiplier = 1.0;
      }
    }
    
    // Check for extra life power-up
    checkExtraLife();
    
    // Move player left/right based on keys pressed with time multiplier
    const adjustedSpeed = player.value.speed * timeMultiplier;
    if (keysPressed.ArrowLeft) {
      player.value.x = Math.max(0, player.value.x - adjustedSpeed);
    }
    if (keysPressed.ArrowRight) {
      player.value.x = Math.min(gameWidth - player.value.width, player.value.x + adjustedSpeed);
    }
    
    // Note: Shield activation via S key is handled by direct event listener below
    if (keysPressed.KeyT) { // T for Time slow
      activateSlowTime();
    }
  };
  
  const drawPlayer = (ctx, debugMode = false) => {
    const { x, y, width, height, color } = player.value;
    
    // Pangolin body: elongated oval with armored scales
    ctx.save();
    ctx.fillStyle = '#8B4513'; // Brown pangolin color
    
    // Main body - elongated oval
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height * 0.6, width * 0.45, height * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw armored scales on body
    ctx.fillStyle = '#654321'; // Darker brown for scales
    const scaleRows = 4;
    const scalesPerRow = 5;
    for (let row = 0; row < scaleRows; row++) {
      for (let col = 0; col < scalesPerRow; col++) {
        const scaleX = x + width * 0.15 + (col * width * 0.15);
        const scaleY = y + height * 0.35 + (row * height * 0.15);
        const scaleSize = width * 0.06;
        
        ctx.beginPath();
        ctx.ellipse(scaleX, scaleY, scaleSize, scaleSize * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Pangolin head with elongated snout
    ctx.save();
    ctx.fillStyle = '#A0522D'; // Slightly lighter brown for head
    
    // Head base (rounded)
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height * 0.2, width * 0.25, height * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Elongated snout
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height * 0.1, width * 0.15, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eyes - small and beady
    ctx.save();
    ctx.fillStyle = '#000';
    const eyeY = y + height * 0.18;
    const eyeSize = width * 0.025;
    ctx.beginPath();
    ctx.arc(x + width * 0.42, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(x + width * 0.58, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Nose - small dark spot at tip of snout
    ctx.save();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.06, width * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Front legs with claws
    ctx.save();
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    
    // Left front leg
    ctx.beginPath();
    ctx.ellipse(x + width * 0.2, y + height * 0.75, width * 0.08, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Right front leg
    ctx.beginPath();
    ctx.ellipse(x + width * 0.8, y + height * 0.75, width * 0.08, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Claws
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    // Left claws
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + width * 0.2 + (i - 1) * width * 0.02, y + height * 0.82);
      ctx.lineTo(x + width * 0.2 + (i - 1) * width * 0.02, y + height * 0.88);
      ctx.stroke();
    }
    
    // Right claws
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + width * 0.8 + (i - 1) * width * 0.02, y + height * 0.82);
      ctx.lineTo(x + width * 0.8 + (i - 1) * width * 0.02, y + height * 0.88);
      ctx.stroke();
    }
    ctx.restore();

    // Back legs
    ctx.save();
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    
    // Left back leg
    ctx.beginPath();
    ctx.ellipse(x + width * 0.3, y + height * 0.9, width * 0.08, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Right back leg
    ctx.beginPath();
    ctx.ellipse(x + width * 0.7, y + height * 0.9, width * 0.08, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Tail - thick and armored
    ctx.save();
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    
    // Tail segments
    for (let i = 0; i < 3; i++) {
      const tailX = x + width / 2;
      const tailY = y + height * 0.95 + (i * height * 0.08);
      const tailWidth = width * (0.12 - i * 0.02);
      
      ctx.beginPath();
      ctx.ellipse(tailX, tailY, tailWidth, height * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    
    // Draw shield effect if active
    if (player.value.shieldActive) {
      ctx.save();
      const shieldAlpha = Math.sin(Date.now() * 0.01) * 0.3 + 0.7; // Pulsing effect
      ctx.globalAlpha = shieldAlpha;
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, Math.max(width, height) / 1.5, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner shield ring
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, Math.max(width, height) / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

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
    timeState,
    updatePlayer,
    drawPlayer,
    resetPlayer,
    activateShield,
    activateSlowTime,
    checkExtraLife
  };
}
