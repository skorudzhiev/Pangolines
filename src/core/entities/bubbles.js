import { ref } from 'vue';

// IMPROVED: Arcade mode configuration with more dynamic difficulty progression
// [0] = Colossal (120), [1] = Titanic (100), [2] = Giant (80), [3] = Large (60)
// [4] = Medium (40), [5] = Small (25), [6] = Tiny (14)
export const arcadeConfigurations = [
  // Easy levels (1-5)
  { bubbleCounts: [0, 0, 0, 0, 1, 0, 0], speed: 0.8 },          // Level 1: 1 Medium
  { bubbleCounts: [0, 0, 0, 0, 2, 1, 0], speed: 0.9 },          // Level 2: 2 Medium, 1 Small
  { bubbleCounts: [0, 0, 0, 1, 1, 1, 0], speed: 1.0 },          // Level 3: 1 Large, 1 Medium, 1 Small
  { bubbleCounts: [0, 0, 0, 2, 0, 2, 0], speed: 1.1 },          // Level 4: 2 Large, 2 Small
  { bubbleCounts: [0, 0, 1, 0, 2, 1, 0], speed: 1.2 },          // Level 5: 1 Giant, 2 Medium, 1 Small
  
  // Medium levels (6-10)
  { bubbleCounts: [0, 0, 1, 1, 1, 2, 0], speed: 1.3 },          // Level 6: 1 Giant, 1 Large, 1 Medium, 2 Small
  { bubbleCounts: [0, 0, 2, 0, 0, 3, 0], speed: 1.4 },          // Level 7: 2 Giant, 3 Small
  { bubbleCounts: [0, 1, 1, 1, 0, 0, 3], speed: 1.5 },          // Level 8: 1 Titanic, 1 Giant, 1 Large, 3 Tiny
  { bubbleCounts: [0, 1, 0, 2, 2, 2, 0], speed: 1.6 },          // Level 9: 1 Titanic, 2 Large, 2 Medium, 2 Small
  { bubbleCounts: [0, 1, 2, 0, 0, 0, 4], speed: 1.7 },          // Level 10: 1 Titanic, 2 Giant, 4 Tiny
  
  // Hard levels (11-15)
  { bubbleCounts: [1, 0, 0, 2, 2, 0, 0], speed: 1.8 },          // Level 11: 1 Colossal, 2 Large, 2 Medium
  { bubbleCounts: [1, 0, 1, 0, 3, 2, 0], speed: 1.9 },          // Level 12: 1 Colossal, 1 Giant, 3 Medium, 2 Small
  { bubbleCounts: [1, 1, 0, 0, 0, 4, 2], speed: 2.0 },          // Level 13: 1 Colossal, 1 Titanic, 4 Small, 2 Tiny
  { bubbleCounts: [1, 1, 1, 2, 0, 0, 0], speed: 2.1 },          // Level 14: 1 Colossal, 1 Titanic, 1 Giant, 2 Large
  { bubbleCounts: [2, 0, 2, 0, 0, 0, 0], speed: 2.2 },          // Level 15: 2 Colossal, 2 Giant
  
  // Expert levels (16-20) - add more challenge
  { bubbleCounts: [2, 1, 0, 0, 0, 3, 2], speed: 2.3 },          // Level 16: 2 Colossal, 1 Titanic, 3 Small, 2 Tiny
  { bubbleCounts: [2, 2, 0, 2, 0, 0, 0], speed: 2.4 },          // Level 17: 2 Colossal, 2 Titanic, 2 Large
  { bubbleCounts: [3, 0, 0, 0, 4, 0, 0], speed: 2.5 },          // Level 18: 3 Colossal, 4 Medium
  { bubbleCounts: [3, 0, 3, 0, 0, 0, 0], speed: 2.6 },          // Level 19: 3 Colossal, 3 Giant
  { bubbleCounts: [4, 0, 0, 0, 0, 0, 0], speed: 2.7 },          // Level 20: 4 Colossal
];

export const bubbleSizes = [
  { radius: 120, speed: 1.3, points: 0.5 },   // Colossal
  { radius: 100, speed: 1.6, points: 1 },   // Titanic
  { radius: 80, speed: 1.9, points: 2 },    // Giant
  { radius: 60, speed: 2.2, points: 3 },   // Large
  { radius: 40, speed: 2.6, points: 4 },   // Medium
  { radius: 25, speed: 3.2, points: 5 },   // Small
  { radius: 14, speed: 4.0, points: 6 }    // Tiny
];

export function useBubbles(gameWidth, gameHeight) {
  const bubbles = ref([]);
  const speedMultipliers = ref([1, 1, 1]);
  const difficultyMultiplier = ref(1);
  // Reference bubbleSizes here, do not redeclare

  
  // CHANGED: Default size is now Medium (4) instead of Colossal (0)
  const createBubble = (x, y, size = 4, velocityX = null) => {
    
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

    bubbles.value = [];
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
  const addRandomBubbles = (difficulty = 1) => {
    
    // Safety check - ensure we have configurations
    if (!arcadeConfigurations || arcadeConfigurations.length === 0) {
      console.error('ERROR: arcadeConfigurations is empty or undefined!');
      return; // Exit early to prevent errors
    }
    
    // FIXED: Ensure difficulty is at least 1, and properly convert to 0-based index
    // Clamp difficulty to valid range
    const validDifficulty = Math.max(1, Math.min(difficulty, 100)); // Cap at reasonable max
    const safeIndex = Math.min(Math.floor(validDifficulty) - 1, arcadeConfigurations.length - 1);
    
    // Double-check we have a valid index
    if (safeIndex < 0 || safeIndex >= arcadeConfigurations.length) {
      console.error(`ERROR: Invalid arcade config index: ${safeIndex}`);
      return; // Exit early to prevent errors
    }
    
    const config = arcadeConfigurations[safeIndex];
    
    // Ensure we have a valid config
    if (!config) {
      console.error(`ERROR: Missing arcade configuration at index ${safeIndex}`);
      return; // Exit early
    }
    
    
    difficultyMultiplier.value = validDifficulty;
    
    // Ensure config.speed exists with a fallback
    const speedMultiplier = config.speed || 1.0;
    speedMultipliers.value = Array(bubbleSizes.length).fill(speedMultiplier);
    
    // Process bubble spawn counts for each size (with safety checks)
    if (config.bubbleCounts && Array.isArray(config.bubbleCounts)) {
      // Limit the loop to the valid range of both arrays
      const maxIndex = Math.min(config.bubbleCounts.length, bubbleSizes.length);
      
      for (let sizeIndex = 0; sizeIndex < maxIndex; sizeIndex++) {
        // Get count with safety check
        const count = config.bubbleCounts[sizeIndex] || 0;
        
        // Only spawn bubbles if count > 0
        for (let i = 0; i < count; i++) {
          const x = Math.random() * (gameWidth - 200) + 100;
          const y = 100;
          
          // Create bubble safely
          try {
            const newBubble = createBubble(x, y, sizeIndex);
            bubbles.value.push(newBubble);
          } catch (error) {
            console.error(`Error creating bubble of size ${sizeIndex}:`, error);
          }
        }
      }
    } else {
      console.error('Invalid bubbleCounts configuration:', config.bubbleCounts);
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
