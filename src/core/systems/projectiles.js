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
    const hasAnchorShot = store.powerUps.find(p => p.id === 'anchorShot' && p.isPurchased);
    
    const width = hasLargerShots ? 8 : 4;
    const speed = hasRapidFire ? 15 : 10;
    const isExplosive = !!hasExplosive;
    const isAnchorShot = !!hasAnchorShot;
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
            anchorShot: isAnchorShot,
            homing: isHoming,
            angle: angle,
            vx: Math.sin(angle) * speed * 0.3,
            vy: -speed,
            target: null,
            anchorShotHits: 0
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
          color: isHoming ? '#00ffff' : (isAnchorShot ? '#ff00ff' : '#fff'),
          active: true,
          explosive: isExplosive,
          anchorShot: isAnchorShot,
          homing: isHoming,
          angle: 0,
          vx: 0,
          vy: -speed,
          target: null,
          anchorShotHits: 0
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
            color: isHoming ? '#00ffff' : (isAnchorShot ? '#ff00ff' : '#fff'),
            active: true,
            explosive: isExplosive,
            anchorShot: isAnchorShot,
            homing: isHoming,
            angle: 0,
            vx: 0,
            vy: -speed,
            target: null,
            anchorShotHits: 0
          });
        }
      }
    }
  };
  
  const updateProjectiles = (gameHeight, bubbles = [], timeMultiplier = 1.0) => {
    // Update each projectile
    projectiles.value.forEach((projectile, index) => {
      if (projectile.active) {
        // Homing behavior
        if (projectile.homing && bubbles.length > 0) {
          // Ensure bubbles have active property (default to true if missing)
          const validBubbles = bubbles.filter(bubble => bubble.active !== false);
          
          if (validBubbles.length > 0) {
            // Find nearest bubble if no target or target is inactive
            if (!projectile.target || projectile.target.active === false) {
              let nearestBubble = null;
              let nearestDistance = Infinity;
              
              validBubbles.forEach(bubble => {
                const dx = bubble.x - projectile.x;
                const dy = bubble.y - projectile.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < nearestDistance) {
                  nearestDistance = distance;
                  nearestBubble = bubble;
                }
              });
              
              projectile.target = nearestBubble;
            }
            
            // Steer towards target
            if (projectile.target && projectile.target.active !== false) {
              const dx = projectile.target.x - projectile.x;
              const dy = projectile.target.y - projectile.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0) {
                // Calculate direct vector to target
                const targetVx = (dx / distance) * projectile.speed;
                const targetVy = (dy / distance) * projectile.speed;
                
                // Apply stronger steering force for visible homing
                projectile.vx = targetVx;
                projectile.vy = targetVy;
              }
            }
          }
        }
        
        // Update position based on velocity
        if (projectile.vx !== undefined && projectile.vy !== undefined) {
          projectile.x += projectile.vx * timeMultiplier;
          projectile.y += projectile.vy * timeMultiplier;
          
          // For homing projectiles, adjust height based on movement
          if (projectile.homing) {
            projectile.height = Math.max(projectile.height, Math.abs(projectile.vy * timeMultiplier));
          } else {
            projectile.height += Math.abs(projectile.vy);
          }
        } else {
          // Traditional projectile behavior
          projectile.height += projectile.speed;
          projectile.y -= projectile.speed;
        }
        
        // Remove projectile if it reaches the top or goes out of bounds
        if ((projectile.homing || projectile.anchorShot) &&
            (projectile.y <= -projectile.height || projectile.y >= gameHeight || 
             projectile.x <= -projectile.width || projectile.x >= 800 + projectile.width)) {
          projectile.active = false;
        } else if (!projectile.homing && !projectile.anchorShot && projectile.y <= 0) {
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
        if (projectile.homing) {
          // Draw targeting line to locked bubble
          if (projectile.target && projectile.target.active) {
            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(projectile.x + projectile.width/2, projectile.y + projectile.height/2);
            ctx.lineTo(projectile.target.x + projectile.target.width/2, projectile.target.y + projectile.target.height/2);
            ctx.stroke();
            ctx.restore();
          }
          
          // Homing projectiles get a bright cyan color with glow effect
          ctx.fillStyle = '#00ffff';
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 8;
          ctx.fillRect(
            projectile.x,
            projectile.y,
            projectile.width,
            projectile.height
          );
          ctx.shadowBlur = 0;
          
          // Add a trail effect
          ctx.fillStyle = '#0088ff';
          ctx.globalAlpha = 0.6;
          ctx.fillRect(
            projectile.x - projectile.vx * 0.5,
            projectile.y - projectile.vy * 0.5,
            projectile.width * 0.8,
            projectile.height * 0.8
          );
          ctx.globalAlpha = 1.0;
        } else {
          ctx.fillStyle = projectile.color;
          ctx.fillRect(
            projectile.x,
            projectile.y,
            projectile.width,
            projectile.height
          );
        }
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
  
  // Get collision info for external systems
  const getProjectileCollisionInfo = (projectile) => {
    return {
      isPiercing: projectile.anchorShot || false,
      isExplosive: projectile.explosive || false,
      anchorShotHits: projectile.anchorShotHits || 0
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
    getProjectileCollisionInfo
  };
}

// Handle projectile collision with bubble (for import in collisions.js)
export function handleProjectileCollision(projectile, bubble) {
  if (projectile.anchorShot) {
    projectile.anchorShotHits++;
    if (projectile.anchorShotHits >= 3 || bubble.size <= 20) {
      projectile.active = false;
    }
  } else {
    projectile.active = false;
  }
}

