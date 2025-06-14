import { ref } from 'vue';

export const bubbleSizes = [
  { radius: 120, speed: 1.3, points: 2 },   // Colossal
  { radius: 100, speed: 1.6, points: 3 },   // Titanic
  { radius: 80, speed: 1.9, points: 5 },    // Giant
  { radius: 60, speed: 2.2, points: 10 },   // Large
  { radius: 40, speed: 2.6, points: 20 },   // Medium
  { radius: 25, speed: 3.2, points: 35 },   // Small
  { radius: 14, speed: 4.0, points: 55 }    // Tiny
];

export function useBubbles(gameWidth, gameHeight) {
  const bubbles = ref([]);
  const speedMultipliers = ref([1, 1, 1]);
  const difficultyMultiplier = ref(1);
  // Reference bubbleSizes here, do not redeclare

  
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
    // Reset speed multipliers to default values for all sizes
    speedMultipliers.value = Array(bubbleSizes.length).fill(1);

    // Start with 2 giant bubbles
    bubbles.value = [
      createBubble(gameWidth / 3, gameHeight - 200, 0),
      createBubble(gameWidth * 2 / 3, gameHeight - 200, 0)
    ];
  };
  
  const initializeLevel = (bubbleCounts, speeds) => {
    // Update speed multipliers, pad/truncate for new sizes
    speedMultipliers.value = speeds.length === bubbleSizes.length ? speeds : Array(bubbleSizes.length).fill(1).map((_, i) => speeds[i] || 1);

    // Clear existing bubbles
    bubbles.value = [];

    // Create bubbles based on the level configuration
    for (let size = 0; size < bubbleCounts.length; size++) {
      const count = bubbleCounts[size];
      for (let i = 0; i < count; i++) {
        // Calculate position with good spacing based on the number of bubbles
        const x = (gameWidth / (count + 1)) * (i + 1);
        const y = gameHeight - 200 - (size * 50);
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
      // For extra variety, randomize the horizontal speed slightly
      const baseSpeed = bubbleSizes[newSize].speed;
      const speedVariance = 0.4;
      const leftSpeed = -(baseSpeed + (Math.random() - 0.5) * speedVariance);
      const rightSpeed = baseSpeed + (Math.random() - 0.5) * speedVariance;
      bubbles.value.push(
        createBubble(bubble.x, bubble.y, newSize, leftSpeed),
        createBubble(bubble.x, bubble.y, newSize, rightSpeed)
      );
    }
  };
  
  const drawBubbles = (ctx, debugMode = false) => {
    bubbles.value.forEach(bubble => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = bubble.color;
      ctx.fill();

      // Debug: draw hitbox
      if (debugMode) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

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
  // Gentler scaling for arcade mode
  difficultyMultiplier.value = difficulty;

  // Make speed multipliers less aggressive
  speedMultipliers.value = Array(bubbleSizes.length).fill(1).map((_, i) => 1 + (difficulty - 1) * 0.08 + i * 0.03);

  for (let i = 0; i < count; i++) {
    // Only allow Medium (4) and smaller at the start; unlock larger at much higher difficulty
    let minSizeIndex = 4; // Medium
    let maxSizeIndex = Math.min(minSizeIndex + Math.floor((difficulty + 2) / 2) - 1, bubbleSizes.length - 1);
    if (difficulty > 15) minSizeIndex = 0; // Allow all sizes at very high difficulty
    let weights = [];
    for (let s = minSizeIndex; s <= maxSizeIndex; s++) {
      // At low difficulty, much higher weight for largest available
      const base = Math.max(1, (maxSizeIndex + 1 - s) * 3);
      // At higher difficulties, increase weight for smaller bubbles
      const weight = base + (difficulty > 7 ? (bubbleSizes.length - s) * (difficulty - 6) : 0);
      weights.push(weight);
    }
    const total = weights.reduce((a, b) => a + b, 0);
    let rnd = Math.random() * total;
    let chosenSize = minSizeIndex;
    for (let idx = 0; idx < weights.length; idx++) {
      if (rnd < weights[idx]) {
        chosenSize = minSizeIndex + idx;
        break;
      }
      rnd -= weights[idx];
    }
    const x = Math.random() * (gameWidth - 200) + 100;
    const y = 100;
    bubbles.value.push(createBubble(x, y, chosenSize));
  }
}

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
