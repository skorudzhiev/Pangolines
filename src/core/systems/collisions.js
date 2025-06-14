import { ref } from 'vue';
import store from '../../store.js';
import { bubbleSizes } from '../entities/bubbles.js';

import useAudioManager from '../../composables/useAudioManager';

export function useCollisions(player, bubbles, projectiles) {
  // Use store.score as the single source of truth for score
  const score = store;
  // const score = ref(0); // Removed
  const gameOver = ref(false);
  const bubbleHitCallbacks = [];
  const { playSfx } = useAudioManager();
  
  // Register a callback for bubble hits (for combo system)
  const onBubbleHit = (callback) => {
    bubbleHitCallbacks.push(callback);
  };
  
  const resetGameState = () => {
    store.score = 0;
    gameOver.value = false;
  };
  
  const checkBubblePlayerCollision = (bubble, playerObj) => {
    // Calculate the distance between bubble center and player
    // We'll simplify by checking if the bubble overlaps with any part of the player
    
    // Check collision with player body (rectangle)
    const closestX = Math.max(playerObj.x, Math.min(bubble.x, playerObj.x + playerObj.width));
    const closestY = Math.max(playerObj.y, Math.min(bubble.y, playerObj.y + playerObj.height));
    
    const distanceX = bubble.x - closestX;
    const distanceY = bubble.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    return distance < bubble.radius;
  };
  
  const checkBubbleProjectileCollision = (bubble, projectile) => {
    // For vertical line projectile, check if any part of the line intersects with the bubble
    // We simplify by checking if the horizontal position of the projectile is within the bubble's width
    // and if any part of the vertical line passes through the bubble
    
    const horizontalDistance = Math.abs(bubble.x - (projectile.x + projectile.width / 2));
    
    if (horizontalDistance > bubble.radius) {
      return false;
    }
    
    // Check if the top of the projectile is below the bottom of the bubble
    // or if the bottom of the projectile is above the top of the bubble
    const projectileTop = projectile.y;
    const projectileBottom = projectile.y + projectile.height;
    const bubbleTop = bubble.y - bubble.radius;
    const bubbleBottom = bubble.y + bubble.radius;
    
    if (projectileBottom < bubbleTop || projectileTop > bubbleBottom) {
      return false;
    }
    
    return true;
  };
  
  const checkCollisions = (comboMultiplier = 1) => {
    // Check for collisions between bubbles and player
    for (const bubble of bubbles.value) {
      if (checkBubblePlayerCollision(bubble, player.value)) {
        gameOver.value = true;
        // We want to continue checking other collisions so the player can still see
        // other bubble hits even if they're going to lose
      }
    }
    
    // Check for collisions between bubbles and projectiles
    for (const projectile of projectiles.value) {
      if (!projectile.active) continue;
      
      for (let i = 0; i < bubbles.value.length; i++) {
        const bubble = bubbles.value[i];
        
        if (checkBubbleProjectileCollision(bubble, projectile)) {
           // Remove the projectile
           projectile.active = false;

           // Play pop SFX
           playSfx('/src/assets/audio/pop.mp3');

           const projectileIndex = projectiles.value.indexOf(projectile);
           projectiles.value.splice(projectileIndex, 1);
          
          // Add score - with combo multiplier applied
          const pointsEarned = Math.round(bubble.points * comboMultiplier);
          store.score += pointsEarned;
          
          // Notify all registered callbacks about the bubble hit (pass bubble for visual feedback)
          bubbleHitCallbacks.forEach(callback => callback(bubble));
          
          // Add floating score text animation
          if (window.floatingTexts) {
            window.floatingTexts.push({
              x: bubble.x,
              y: bubble.y,
              text: `+${pointsEarned}`,
              color: comboMultiplier > 1 ? '#f87171' : 'white',
              lifespan: 60,
              velocity: { x: 0, y: -1 }
            });
          }

          // EXPLOSIVE PROJECTILES: If this projectile is explosive, pop nearby bubbles too
          if (projectile.explosive) {
            const explosionRadius = 60;
            // Find all bubbles within explosionRadius of the hit bubble (excluding the one already hit)
            const toExplode = bubbles.value.filter(b => b !== bubble && Math.hypot(b.x - bubble.x, b.y - bubble.y) < explosionRadius);
            for (const extraBubble of toExplode) {
              // Remove extra bubble
              const idx = bubbles.value.indexOf(extraBubble);
              if (idx !== -1) {
                // Award points for each extra bubble
                const extraPoints = Math.round(extraBubble.points * comboMultiplier);
                store.score += extraPoints;
                bubbles.value.splice(idx, 1);
                // Optional: floating text for each
                if (window.floatingTexts) {
                  window.floatingTexts.push({
                    x: extraBubble.x,
                    y: extraBubble.y,
                    text: `+${extraPoints}`,
                    color: '#fbbf24',
                    lifespan: 60,
                    velocity: { x: 0, y: -1 }
                  });
                }
              }
            }
          }

          // Split the bubble using the new bubbleSizes logic
const bubbleIndex = bubbles.value.indexOf(bubble);
if (bubbleIndex !== -1) {
  const hitBubble = { ...bubbles.value[bubbleIndex] };
  bubbles.value.splice(bubbleIndex, 1);

  // If not the smallest size, split into two smaller bubbles
  if (hitBubble.size < bubbleSizes.length - 1) {
    const newSize = hitBubble.size + 1;
    const bubbleSize = bubbleSizes[newSize];
    // Add some random variance to horizontal speed
    const baseSpeed = bubbleSize.speed;
    const speedVariance = 0.4;
    const leftSpeed = -(baseSpeed + (Math.random() - 0.5) * speedVariance);
    const rightSpeed = baseSpeed + (Math.random() - 0.5) * speedVariance;
    const absSpeed = Math.abs(baseSpeed);
    bubbles.value.push(
      {
        x: hitBubble.x,
        y: hitBubble.y,
        radius: bubbleSize.radius,
        color: '#ff7e67',
        velocityX: leftSpeed,
        velocityY: -absSpeed * 1.5,
        gravity: 0.1,
        size: newSize,
        points: bubbleSize.points,
        minBounceVelocity: absSpeed * 0.8
      },
      {
        x: hitBubble.x,
        y: hitBubble.y,
        radius: bubbleSize.radius,
        color: '#ff7e67',
                  velocityX: absSpeed,
                  velocityY: -absSpeed * 1.5,
                  gravity: 0.1,
                  size: newSize,
                  points: bubbleSize.points,
                  minBounceVelocity: absSpeed * 0.8
                }
              );
            }
          }
          
          break;
        }
      }
    }
    
    // Check if all bubbles are cleared
    if (bubbles.value.length === 0) {
      // Level completed!
      console.log('Level completed!');
    }
  };
  
  return {
    score: store,
    gameOver,
    checkCollisions,
    resetGameState,
    onBubbleHit
  };

}
