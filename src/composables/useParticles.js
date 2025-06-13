import { ref } from 'vue';

export function useParticles() {
  const particles = ref([]);

  function spawnParticles({ x, y, color = '#fff', count = 12 }) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 2;
      particles.value.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        radius: 3 + Math.random() * 2,
        color,
        decay: 0.015 + Math.random() * 0.01
      });
    }
  }

  function updateParticles() {
    particles.value = particles.value.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.alpha -= p.decay;
      return p.alpha > 0;
    });
  }

  function drawParticles(ctx) {
    for (const p of particles.value) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }
  }

  return {
    particles,
    spawnParticles,
    updateParticles,
    drawParticles
  };
}
