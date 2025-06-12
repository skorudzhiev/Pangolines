<template>
  <div class="game-over">
    <h1>Game Over</h1>
    <div class="score-display">Score: {{ score }}</div>
    <div v-if="highScore > 0" class="high-score">High Score: {{ highScore }}</div>
    <UIButton @click="$emit('play-again')">Play Again</UIButton>
  </div>
</template>

<script setup>
import UIButton from '../ui/UIButton.vue'
defineProps({ score: Number, highScore: Number })
defineEmits(['play-again'])
</script>
