import { ref } from 'vue';

export function useCollisions(player, bubbles, projectiles) {
  const score = ref(0);
  const gameOver = ref(false);
  
  const resetGame = () => {
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
        return;
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
          
          // Add score
          score.value += bubble.points;
          
          // Split or remove the bubble
          // Remove the hit bubble
          const bubbleIndex = bubbles.value.indexOf(bubble);
          const hitBubble = bubbles.value[bubbleIndex];
          bubbles.value.splice(bubbleIndex, 1);
          
          // If not the smallest size, split into two smaller bubbles
          if (bubble.size < 2) {
            const newSize = bubble.size + 1;
            const newBubbleRadius = newSize === 1 ? 40 : 20;
            const newBubbleSpeed = newSize === 1 ? 3 : 4;
            
            bubbles.value.push(
              {
                x: bubble.x,
                y: bubble.y,
                radius: newBubbleRadius,
                color: '#ff7e67',
                velocityX: -newBubbleSpeed,
                velocityY: -newBubbleSpeed * 1.5,
                gravity: 0.1,
                size: newSize,
                points: newSize === 1 ? 20 : 30
              },
              {
                x: bubble.x,
                y: bubble.y,
                radius: newBubbleRadius,
                color: '#ff7e67',
                velocityX: newBubbleSpeed,
                velocityY: -newBubbleSpeed * 1.5,
                gravity: 0.1,
                size: newSize,
                points: newSize === 1 ? 20 : 30
              }
            );
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
    resetGame
  };
}
