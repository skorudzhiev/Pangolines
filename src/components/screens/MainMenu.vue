<template>
  <div class="game-start">
    <h1>Pang</h1>
    <div class="game-modes">
      <UIButton @click="$emit('start-game', false)">Arcade Mode</UIButton>
      <UIButton @click="$emit('start-game', true)">Classic Mode</UIButton>
      <UIButton @click="$emit('show-store')">Store</UIButton>
    </div>
    <div v-if="highScore > 0" class="high-score">
      High Score: {{ highScore }}
    </div>
  </div>
</template>

<script setup>
import UIButton from '../ui/UIButton.vue'
defineProps({ highScore: Number })
defineEmits(['start-game', 'show-store'])
</script>
