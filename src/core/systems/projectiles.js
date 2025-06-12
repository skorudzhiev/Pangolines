import { ref } from 'vue';

export function useProjectiles() {
  const projectiles = ref([]);
  const maxProjectiles = ref(1); // Default limit of 1 projectile at a time
  
  const resetProjectiles = () => {
    projectiles.value = [];
  };
  
  const fireProjectile = (x, y) => {
    // Check if the player has reached the maximum number of allowed projectiles
    if (projectiles.value.length < maxProjectiles.value) {
      projectiles.value.push({
        x: x - 2, // Center the projectile
        y,
        width: 4,
        height: 0, // Height will grow
        speed: 10,
        color: '#fff',
        active: true
      });
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
          
          // Remove the projectile after a short delay
          setTimeout(() => {
            projectiles.value.splice(index, 1);
          }, 100);
        }
      }
    });
  };
  
  const drawProjectiles = (ctx) => {
    projectiles.value.forEach(projectile => {
      if (projectile.active) {
        ctx.fillStyle = projectile.color;
        ctx.fillRect(
          projectile.x,
          projectile.y,
          projectile.width,
          projectile.height
        );
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
