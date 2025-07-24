import { ref } from 'vue';
import store from '../../store.js';

export function useMagneticCollector() {
  const magneticRange = ref(150); // Range for magnetic attraction
  const magneticStrength = ref(0.8); // Strength of magnetic pull
  
  // Check if magnetic collector power-up is active
  const isMagneticActive = () => {
    return store.powerUps.find(p => p.id === 'magneticCollect' && p.isPurchased);
  };
  
  // Apply magnetic force to pickups/score items
  const applyMagneticForce = (pickups, playerX, playerY, playerWidth, playerHeight) => {
    if (!isMagneticActive()) return;
    
    const playerCenterX = playerX + playerWidth / 2;
    const playerCenterY = playerY + playerHeight / 2;
    
    pickups.forEach(pickup => {
      if (!pickup.active) return;
      
      const dx = playerCenterX - (pickup.x + pickup.width / 2);
      const dy = playerCenterY - (pickup.y + pickup.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Apply magnetic force if within range
      if (distance < magneticRange.value && distance > 0) {
        const force = magneticStrength.value * (1 - distance / magneticRange.value);
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        // Apply force to pickup
        pickup.x += normalizedDx * force * 2;
        pickup.y += normalizedDy * force * 2;
        
        // Add some visual feedback
        pickup.magnetic = true;
      } else {
        pickup.magnetic = false;
      }
    });
  };
  
  // Draw magnetic field effect (optional visual feedback)
  const drawMagneticField = (ctx, playerX, playerY, playerWidth, playerHeight) => {
    if (!isMagneticActive()) return;
    
    const playerCenterX = playerX + playerWidth / 2;
    const playerCenterY = playerY + playerHeight / 2;
    
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(playerCenterX, playerCenterY, magneticRange.value, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };
  
  return {
    isMagneticActive,
    applyMagneticForce,
    drawMagneticField,
    magneticRange,
    magneticStrength
  };
}
