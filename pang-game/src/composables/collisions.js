import { ref } from 'vue';

export function useCollisions(player, bubbles, projectiles) {
  const score = ref(0);
  const gameOver = ref(false);
  
  const resetGameState = () => {
    score.value = 0;
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
  
  const checkCollisions = () => {
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
          const projectileIndex = projectiles.value.indexOf(projectile);
          projectiles.value.splice(projectileIndex, 1);
          
          // Add score - base points plus bonus for quick consecutive hits
          score.value += bubble.points;
          
          // Split the bubble using the splitBubble function from bubbles.js
          const bubbleIndex = bubbles.value.indexOf(bubble);
          if (bubbleIndex !== -1) {
            // Store the bubble data before removing it
            const hitBubble = {...bubbles.value[bubbleIndex]};
            
            // Remove the bubble first (this is important for clean state management)
            bubbles.value.splice(bubbleIndex, 1);
            
            // If not the smallest size, split into two smaller bubbles
            if (hitBubble.size < 2) {
              const newSize = hitBubble.size + 1;
              const bubbleSize = newSize === 1 ? 
                { radius: 40, speed: 3, points: 20 } : 
                { radius: 20, speed: 4, points: 30 };
              
              // Calculate speed based on the original bubble's speed multiplier
              const speed = bubbleSize.speed * (hitBubble.velocityX > 0 ? 1 : -1);
              const absSpeed = Math.abs(speed);
              
              // Create the two new bubbles
              bubbles.value.push(
                {
                  x: hitBubble.x,
                  y: hitBubble.y,
                  radius: bubbleSize.radius,
                  color: '#ff7e67',
                  velocityX: -absSpeed,
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
    score,
    gameOver,
    checkCollisions,
    resetGameState
  };
}
