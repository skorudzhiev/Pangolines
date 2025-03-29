import { ref } from 'vue';

export function useBubbles(gameWidth, gameHeight) {
  const bubbles = ref([]);
  
  // Bubble sizes and properties
  const bubbleSizes = [
    { radius: 60, speed: 2, points: 10 },
    { radius: 40, speed: 3, points: 20 },
    { radius: 20, speed: 4, points: 30 }
  ];
  
  const createBubble = (x, y, size = 0, velocityX = null) => {
    const bubbleSize = bubbleSizes[size];
    return {
      x,
      y,
      radius: bubbleSize.radius,
      color: '#ff7e67',
      velocityX: velocityX || (Math.random() > 0.5 ? bubbleSize.speed : -bubbleSize.speed),
      velocityY: -bubbleSize.speed * 1.5,
      gravity: 0.1,
      size,
      points: bubbleSize.points
    };
  };
  
  const resetBubbles = () => {
    // Start with 2 large bubbles
    bubbles.value = [
      createBubble(gameWidth / 3, gameHeight - 200, 0),
      createBubble(gameWidth * 2 / 3, gameHeight - 200, 0)
    ];
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
        bubble.velocityY = -Math.abs(bubble.velocityY) * 0.8; // Dampen bounce
      }
      
      // Bounce off ceiling
      if (bubble.y - bubble.radius < 0) {
        bubble.y = bubble.radius;
        bubble.velocityY = Math.abs(bubble.velocityY) * 0.8; // Dampen bounce
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
    splitBubble
  };
}
