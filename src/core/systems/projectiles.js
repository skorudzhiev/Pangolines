import { ref } from 'vue';
import store from '../../store.js';

import useAudioManager from '../../composables/useAudioManager';

export function useProjectiles() {
  const projectiles = ref([]);
  const maxProjectiles = ref(1); // Default limit of 1 projectile at a time
  const { playSfx } = useAudioManager();
  
  const resetProjectiles = () => {
    projectiles.value = [];
  };
  
  const fireProjectile = (x, y) => {
    // Check power-ups
    const hasLargerShots = store.powerUps.find(p => p.id === 'largerShots' && p.isPurchased);
    const hasDoubleProjectiles = store.powerUps.find(p => p.id === 'doubleProjectiles' && p.isPurchased);
    const hasExplosive = store.powerUps.find(p => p.id === 'explosiveProjectiles' && p.isPurchased);
    const width = hasLargerShots ? 8 : 4;
    const isExplosive = !!hasExplosive;
    
    // Only allow up to maxProjectiles (default 1)
    if (projectiles.value.length < maxProjectiles.value) {
      // Play shoot SFX
      playSfx('/sounds/shoot.mp3');
      // Main projectile
      projectiles.value.push({
        x: x - width / 2, // Center
        y,
        width,
        height: 0,
        speed: 10,
        color: '#fff',
        active: true,
        explosive: isExplosive
      });
      // Double shot
      if (hasDoubleProjectiles) {
        // Slight horizontal offset for second projectile
        projectiles.value.push({
          x: x + 10 - width / 2,
          y,
          width,
          height: 0,
          speed: 10,
          color: '#fff',
          active: true,
          explosive: isExplosive
        });
      }
    }
  };
  
  const updateProjectiles = (gameHeight) => {
    // Update each projectile
    projectiles.value.forEach((projectile, index) => {
      if (projectile.active) {
        // The projectile extends upward, growing in height
        projectile.height += projectile.speed;
        projectile.y -= projectile.speed;
        
        // Remove projectile if it reaches the top of the screen
        if (projectile.y <= 0) {
          projectile.y = 0;
          projectile.active = false;
        }
      }
    });
    // Filter out inactive projectiles
    projectiles.value = projectiles.value.filter(projectile => projectile.active);
  };
  
  const drawProjectiles = (ctx, debugMode = false) => {
    projectiles.value.forEach(projectile => {
      if (projectile.active) {
        ctx.fillStyle = projectile.color;
        ctx.fillRect(
          projectile.x,
          projectile.y,
          projectile.width,
          projectile.height
        );
        // Debug: draw hitbox
        if (debugMode) {
          ctx.save();
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            projectile.x,
            projectile.y,
            projectile.width,
            projectile.height
          );
          ctx.restore();
        }
      }
    });
  };
  
  const removeProjectile = (projectile) => {
    const index = projectiles.value.indexOf(projectile);
    if (index !== -1) {
      projectiles.value.splice(index, 1);
    }
  };
  
  // Update max projectiles (can be used for power-ups in future levels)
  const setMaxProjectiles = (count) => {
    maxProjectiles.value = count;
  };
  
  return {
    projectiles,
    fireProjectile,
    updateProjectiles,
    drawProjectiles,
    removeProjectile,
    resetProjectiles,
    setMaxProjectiles
  };
}
