import { ref } from 'vue';

export function useBubbles(gameWidth, gameHeight) {
  const bubbles = ref([]);
  const speedMultipliers = ref([1, 1, 1]);
  const difficultyMultiplier = ref(1);
  
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
        
        // Correct position if out of bounds
        if (bubble.x - bubble.radius < 0) {
          bubble.x = bubble.radius;
        } else if (bubble.x + bubble.radius > gameWidth) {
          bubble.x = gameWidth - bubble.radius;
        }
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
  
  // Add random bubbles based on difficulty
  const addRandomBubbles = (count = 1, difficulty = 1) => {
    difficultyMultiplier.value = difficulty;
    
    // Calculate adjusted bubble speed based on difficulty
    for (let i = 0; i < speedMultipliers.value.length; i++) {
      speedMultipliers.value[i] = 1 + (difficulty - 1) * 0.2; // Gradually increase speed with difficulty
    }
    
    // Add random bubbles
    for (let i = 0; i < count; i++) {
      // Randomly decide bubble size, with higher difficulty favoring smaller bubbles
      let sizeOptions = [0]; // Start with just large bubbles
      
      if (difficulty > 2) sizeOptions.push(1); // Add medium bubbles after difficulty 2
      if (difficulty > 4) sizeOptions.push(2); // Add small bubbles after difficulty 4
      
      const size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];
      
      // Place bubble at random position near the top
      const x = Math.random() * (gameWidth - 200) + 100; // Keep away from edges
      const y = 100; // Start near the top
      
      bubbles.value.push(createBubble(x, y, size));
    }
  };
  
  return {
    bubbles,
    updateBubbles,
    drawBubbles,
    resetBubbles,
    splitBubble,
    initializeLevel,
    addRandomBubbles
  };
}
