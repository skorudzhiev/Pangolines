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
import Score from '../ui/Score.vue'
defineProps({
  score: Number,
  comboCounter: Number,
  comboMultiplier: Number,
  classicMode: Boolean,
  currentLevel: Number,
  difficulty: Number
})
</script>
