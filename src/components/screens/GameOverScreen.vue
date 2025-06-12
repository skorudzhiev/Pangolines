<template>
  <div class="game-over">
    <h1>Game Over</h1>
    <div class="score-display">Score: {{ score }}</div>
    <div v-if="highScore > 0" class="high-score">High Score: {{ highScore }}</div>
    <button @click="$emit('play-again')">Play Again</button>
  </div>
</template>

<script setup>
defineProps({ score: Number, highScore: Number })
defineEmits(['play-again'])
</script>
