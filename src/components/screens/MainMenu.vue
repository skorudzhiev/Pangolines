<template>
  <div class="game-start">
    <h1>Pang</h1>
    <div class="game-modes">
      <button @click="$emit('start-game', false)">Arcade Mode</button>
      <button @click="$emit('start-game', true)">Classic Mode</button>
      <button @click="$emit('show-store')">Store</button>
    </div>
    <div v-if="highScore > 0" class="high-score">
      High Score: {{ highScore }}
    </div>
  </div>
</template>

<script setup>
defineProps({ highScore: Number })
defineEmits(['start-game', 'show-store'])
</script>
