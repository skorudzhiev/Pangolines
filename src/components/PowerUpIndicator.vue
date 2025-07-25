<template>
  <div class="powerup-indicator">
    <span v-for="powerUp in activePowerUps" :key="powerUp.id" class="powerup-item" :class="`powerup-${powerUp.id}`">
      <span class="powerup-icon">{{ getPowerUpIcon(powerUp.id) }}</span>
      <span class="powerup-name">{{ powerUp.name }}</span>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import store from '../store.js';

const activePowerUps = computed(() =>
  store.powerUps.filter(p => p.isPurchased)
);

const getPowerUpIcon = (powerUpId) => {
  const icons = {
    fasterMovement: '🏃',
    largerShots: '🔵',
    explosiveProjectiles: '💥',
    doubleProjectiles: '➿',
    shield: '🛡️',
    slowTime: '⏰',
    multiShot: '🎯',
    homingProjectiles: '🧲',
    rapidFire: '⚡',
    anchorShot: '⚓',
    extraLife: '❤️'
  };
  return icons[powerUpId] || '⚡';
};
</script>

<style scoped>
.powerup-indicator {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  background: rgba(0,0,0,0.5);
  padding: 8px 16px;
  border-radius: 8px;
  z-index: 10;
}
.powerup-item {
  display: flex;
  align-items: center;
  color: #fff;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.powerup-homingProjectiles {
  background: linear-gradient(135deg, #00ffff, #0088ff);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.powerup-shield {
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

.powerup-slowTime {
  background: linear-gradient(135deg, #a8e6cf, #7fcdcd);
  box-shadow: 0 0 10px rgba(168, 230, 207, 0.5);
}

.powerup-rapidFire {
  background: linear-gradient(135deg, #ffd93d, #ff9ff3);
  box-shadow: 0 0 10px rgba(255, 217, 61, 0.5);
}

.powerup-multiShot {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  box-shadow: 0 0 10px rgba(255, 154, 158, 0.5);
}

.powerup-icon {
  margin-right: 6px;
  font-size: 1.2em;
}
</style>
