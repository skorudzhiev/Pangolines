<template>
  <div class="game-ui">
    <div class="score-container">
      <Score>Score: {{ score }}</Score>

      <div class="combo-display" :class="{ active: comboCounter > 0 }">
        <span class="combo-counter">{{ comboCounter }}x Combo</span>
        <span class="combo-multiplier">{{ comboMultiplier.toFixed(1) }}x Multiplier</span>
      </div>

    </div>
    <div v-if="classicMode" class="level-display">Level: {{ currentLevel }}</div>
    <div v-else class="difficulty-display">Difficulty: {{ Math.floor(difficulty * 10) / 10 }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Score from '../ui/Score.vue';
import store from '../../store.js';

defineProps({
  score: Number,
  comboCounter: Number,
  comboMultiplier: Number,
  classicMode: Boolean,
  currentLevel: Number,
  difficulty: Number
});

const activePowerUps = computed(() => store.powerUps.filter(p => p.isPurchased));

</script>

<style scoped>
.powerup-chips {
  display: flex;
  gap: 8px;
  margin: 4px 0 0 0;
}
.powerup-chip {
  background: #333;
  color: #ffe066;
  font-size: 0.85em;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  border: 1px solid #555;
}
</style>
