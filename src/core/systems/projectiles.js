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
  
  const fireProjectile = (x, y, bubbles = []) => {
    // Check power-ups
    const hasLargerShots = store.powerUps.find(p => p.id === 'largerShots' && p.isPurchased);
    const hasDoubleProjectiles = store.powerUps.find(p => p.id === 'doubleProjectiles' && p.isPurchased);
    const hasExplosive = store.powerUps.find(p => p.id === 'explosiveProjectiles' && p.isPurchased);
    const hasMultiShot = store.powerUps.find(p => p.id === 'multiShot' && p.isPurchased);
    const hasHoming = store.powerUps.find(p => p.id === 'homingProjectiles' && p.isPurchased);
    const hasRapidFire = store.powerUps.find(p => p.id === 'rapidFire' && p.isPurchased);
    const hasPiercing = store.powerUps.find(p => p.id === 'piercing' && p.isPurchased);
    
    const width = hasLargerShots ? 8 : 4;
    const speed = hasRapidFire ? 15 : 10;
    const isExplosive = !!hasExplosive;
    const isPiercing = !!hasPiercing;
    const isHoming = !!hasHoming;
    
    // Adjust max projectiles based on power-ups
    const currentMaxProjectiles = hasRapidFire ? 3 : maxProjectiles.value;
    
    // Only allow up to maxProjectiles
    if (projectiles.value.length < currentMaxProjectiles) {
      // Play shoot SFX
      playSfx('/sounds/shoot.mp3');
      
      // Multi-shot: fire 3 projectiles in a spread
      if (hasMultiShot) {
        const angles = [-0.3, 0, 0.3]; // Spread angles in radians
        angles.forEach((angle, index) => {
          const offsetX = index === 0 ? -15 : index === 2 ? 15 : 0;
          projectiles.value.push({
            x: x + offsetX - width / 2,
            y,
            width,
            height: 0,
            speed,
            color: hasMultiShot ? '#ffff00' : '#fff',
            active: true,
            explosive: isExplosive,
            piercing: isPiercing,
            homing: isHoming,
            angle: angle,
            vx: Math.sin(angle) * speed * 0.3,
            vy: -speed,
            target: null,
            piercingHits: 0
          });
        });
      } else {
        // Main projectile
        projectiles.value.push({
          x: x - width / 2, // Center
          y,
          width,
          height: 0,
          speed,
          color: isHoming ? '#00ffff' : (isPiercing ? '#ff00ff' : '#fff'),
          active: true,
          explosive: isExplosive,
          piercing: isPiercing,
          homing: isHoming,
          angle: 0,
          vx: 0,
          vy: -speed,
          target: null,
          piercingHits: 0
        });
        
        // Double shot
        if (hasDoubleProjectiles) {
          // Slight horizontal offset for second projectile
          projectiles.value.push({
            x: x + 10 - width / 2,
            y,
            width,
            height: 0,
            speed,
            color: isHoming ? '#00ffff' : (isPiercing ? '#ff00ff' : '#fff'),
            active: true,
            explosive: isExplosive,
            piercing: isPiercing,
            homing: isHoming,
            angle: 0,
            vx: 0,
            vy: -speed,
            target: null,
            piercingHits: 0
          });
        }
      }
    }
  };
  
  const updateProjectiles = (gameHeight, bubbles = []) => {
    // Update each projectile
    projectiles.value.forEach((projectile, index) => {
      if (projectile.active) {
        // Homing behavior
        if (projectile.homing && bubbles.length > 0) {
          // Find nearest bubble if no target or target is inactive
          if (!projectile.target || !projectile.target.active) {
            let nearestBubble = null;
            let nearestDistance = Infinity;
            
            bubbles.forEach(bubble => {
              if (bubble.active) {
                const dx = bubble.x - projectile.x;
                const dy = bubble.y - projectile.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < nearestDistance && distance < 200) { // Homing range
                  nearestDistance = distance;
                  nearestBubble = bubble;
                }
              }
            });
            
            projectile.target = nearestBubble;
          }
          
          // Steer towards target
          if (projectile.target && projectile.target.active) {
            const dx = projectile.target.x - projectile.x;
            const dy = projectile.target.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const homingStrength = 0.3;
              projectile.vx += (dx / distance) * homingStrength;
              projectile.vy += (dy / distance) * homingStrength;
              
              // Normalize velocity to maintain speed
              const currentSpeed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
              if (currentSpeed > 0) {
                projectile.vx = (projectile.vx / currentSpeed) * projectile.speed;
                projectile.vy = (projectile.vy / currentSpeed) * projectile.speed;
              }
            }
          }
        }
        
        // Update position based on velocity
        if (projectile.vx !== undefined && projectile.vy !== undefined) {
          projectile.x += projectile.vx;
          projectile.y += projectile.vy;
          
          // For homing projectiles, adjust height based on movement
          if (projectile.homing) {
            projectile.height = Math.max(projectile.height, Math.abs(projectile.vy));
          } else {
            projectile.height += Math.abs(projectile.vy);
          }
        } else {
          // Traditional projectile behavior
          projectile.height += projectile.speed;
          projectile.y -= projectile.speed;
        }
        
        // Remove projectile if it reaches the edges of the screen
        if (projectile.y <= -projectile.height || projectile.y >= gameHeight || 
            projectile.x <= -projectile.width || projectile.x >= 800 + projectile.width) {
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
  
  // Handle projectile collision with bubble
  const handleProjectileCollision = (projectile, bubble) => {
    if (projectile.piercing) {
      // Piercing projectiles can hit multiple bubbles
      projectile.piercingHits++;
      
      // Remove piercing projectile after hitting 3 bubbles or if it's a small bubble
      if (projectile.piercingHits >= 3 || bubble.size <= 20) {
        projectile.active = false;
      }
    } else {
      // Normal projectiles are removed on hit
      projectile.active = false;
    }
  };
  
  // Get collision info for external systems
  const getProjectileCollisionInfo = (projectile) => {
    return {
      isPiercing: projectile.piercing || false,
      isExplosive: projectile.explosive || false,
      piercingHits: projectile.piercingHits || 0
    };
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
    setMaxProjectiles,
    handleProjectileCollision,
    getProjectileCollisionInfo
  };
}
