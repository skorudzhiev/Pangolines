<template>
  <div class="powerup-indicator">
    <span v-for="powerUp in activePowerUps" :key="powerUp.id" class="powerup-item">
      <span class="powerup-icon">⚡</span>
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
}
.powerup-icon {
  margin-right: 6px;
  font-size: 1.2em;
}
</style>
