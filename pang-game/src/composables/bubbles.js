import { ref } from 'vue';

export function useBubbles(gameWidth, gameHeight) {
  const bubbles = ref([]);
  const speedMultipliers = ref([1, 1, 1]);
  
  // Bubble sizes and properties
  const bubbleSizes = [
    { radius: 60, speed: 1.5, points: 10 },
    { radius: 40, speed: 2, points: 20 },
    { radius: 20, speed: 2.5, points: 30 }
  ];
  
  const createBubble = (x, y, size = 0, velocityX = null) => {
    const bubbleSize = bubbleSizes[size];
    const speed = bubbleSize.speed * speedMultipliers.value[size];
    
    return {
      x,
      y,
      radius: bubbleSize.radius,
      color: '#ff7e67',
      velocityX: velocityX || (Math.random() > 0.5 ? speed : -speed),
      velocityY: -speed * 3.5, // Increased initial upward velocity
      gravity: 0.02, // Reduced gravity for longer float time
      size,
      points: bubbleSize.points,
      minBounceVelocity: speed * 1.2 // Minimum bounce velocity to ensure bubbles always bounce
    };
  };
  
  const resetBubbles = () => {
    // Reset speed multipliers to default values
    speedMultipliers.value = [1, 1, 1];

    // Start with 2 large bubbles
    bubbles.value = [
      createBubble(gameWidth / 3, gameHeight - 200, 0),
      createBubble(gameWidth * 2 / 3, gameHeight - 200, 0)
    ];
  };
  
  const initializeLevel = (bubbleCounts, speeds) => {
    // Update speed multipliers
    speedMultipliers.value = speeds;
    
    // Clear existing bubbles
    bubbles.value = [];
    
    // Create bubbles based on the level configuration
    for (let size = 0; size < bubbleCounts.length; size++) {
      const count = bubbleCounts[size];
      
      for (let i = 0; i < count; i++) {
        // Calculate position with good spacing based on the number of bubbles
        const x = (gameWidth / (count + 1)) * (i + 1);
        const y = gameHeight - 200 - (size * 50); // Stagger heights based on size
        
        bubbles.value.push(createBubble(x, y, size));
      }
    }
  };
  
  const updateBubbles = () => {
    bubbles.value.forEach(bubble => {
      // Apply gravity to vertical velocity
      bubble.velocityY += bubble.gravity;
      
      // Update bubble position
      bubble.x += bubble.velocityX;
      bubble.y += bubble.velocityY;
      
      // Bounce off walls
      if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > gameWidth) {
        bubble.velocityX = -bubble.velocityX;
      }
      
      // Bounce off floor
      if (bubble.y + bubble.radius > gameHeight) {
        bubble.y = gameHeight - bubble.radius;
        // Ensure the bubble always bounces with at least the minimum velocity
        bubble.velocityY = -Math.max(Math.abs(bubble.velocityY) * 1, bubble.minBounceVelocity);
      }
      
      // Bounce off ceiling
      if (bubble.y - bubble.radius < 0) {
        bubble.y = bubble.radius;
        bubble.velocityY = Math.max(Math.abs(bubble.velocityY) * 1, bubble.minBounceVelocity); // Ensure minimum bounce
      }
    });
  };
  
  const splitBubble = (bubble) => {
    // Remove the hit bubble
    const index = bubbles.value.indexOf(bubble);
    bubbles.value.splice(index, 1);
    
    // If not the smallest size, split into two smaller bubbles
    if (bubble.size < bubbleSizes.length - 1) {
      const newSize = bubble.size + 1;
      bubbles.value.push(
        createBubble(bubble.x, bubble.y, newSize, -bubbleSizes[newSize].speed),
        createBubble(bubble.x, bubble.y, newSize, bubbleSizes[newSize].speed)
      );
    }
  };
  
  const drawBubbles = (ctx) => {
    bubbles.value.forEach(bubble => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = bubble.color;
      ctx.fill();
      
      // Add shine effect
      ctx.beginPath();
      ctx.arc(
        bubble.x - bubble.radius * 0.3,
        bubble.y - bubble.radius * 0.3,
        bubble.radius * 0.2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    });
  };
  
  return {
    bubbles,
    updateBubbles,
    drawBubbles,
    resetBubbles,
    splitBubble,
    initializeLevel
  };
}
