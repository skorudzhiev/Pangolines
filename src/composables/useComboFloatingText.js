import { ref } from 'vue';

// Color logic for combo multiplier
function getComboColor(mult) {
  if (mult >= 20) return '#ff00e6'; // magenta
  if (mult >= 16) return '#00eaff'; // cyan
  if (mult >= 8) return '#ffd700'; // gold
  if (mult >= 4) return '#fbbf24'; // orange
  if (mult >= 2) return '#4ade80'; // green
  return '#fff';
}

export function useComboFloatingText(floatingTexts) {
  // Call this when a combo is increased and a bubble is popped
  function showComboText({ x, y, multiplier }) {
    if (multiplier <= 1) return;
    floatingTexts.value.push({
      x,
      y: y - 24, // float above the bubble
      text: `x${multiplier.toFixed(1)}`,
      color: getComboColor(multiplier),
      lifespan: 48,
      velocity: { x: 0, y: -1.1 },
      scale: 1.2,
      fade: true,
      combo: true
    });
  }

  // Draw all floating texts (score & combo)
  function drawFloatingTexts(ctx) {
    if (!floatingTexts.value || !ctx) return;
    for (let i = 0; i < floatingTexts.value.length; i++) {
      const t = floatingTexts.value[i];
      ctx.save();
      // Animate scale pop for combo
      let scale = t.combo ? (t.lifespan > 35 ? 1.2 - (48 - t.lifespan) * 0.01 : 1.0) : 1.0;
      ctx.globalAlpha = t.fade ? Math.max(0, t.lifespan / 48) : 1;
      ctx.font = t.combo ? `bold ${Math.round(26 * scale)}px Arial` : 'bold 20px Arial';
      ctx.fillStyle = t.color || '#fff';
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = t.combo ? 4 : 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
      // Animate
      t.x += t.velocity?.x || 0;
      t.y += t.velocity?.y || -1;
      t.lifespan--;
    }
    // Remove expired
    floatingTexts.value = floatingTexts.value.filter(t => t.lifespan > 0);
  }

  return { showComboText, drawFloatingTexts };
}
