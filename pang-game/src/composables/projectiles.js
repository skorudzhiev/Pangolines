import { ref } from 'vue';

export function useProjectiles() {
  const projectiles = ref([]);
  
  const resetProjectiles = () => {
    projectiles.value = [];
  };
  
  const fireProjectile = (x, y) => {
    // Check if there's already an active projectile
    // In classic Pang, player can only have one projectile at a time
    if (projectiles.value.length < 1) {
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
  
  return {
    projectiles,
    fireProjectile,
    updateProjectiles,
    drawProjectiles,
    removeProjectile,
    resetProjectiles
  };
}
