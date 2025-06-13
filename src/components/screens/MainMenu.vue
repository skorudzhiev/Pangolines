<template>
  <div :class="styles.gameStart">
    <h1>Pang</h1>
    <div :class="styles.gameModes">
      <UIButton @click="$emit('start-game', false)">Arcade Mode</UIButton>
      <UIButton @click="$emit('start-game', true)">Classic Mode</UIButton>
      <UIButton @click="$emit('show-store')">Store</UIButton>
    </div>
    <div v-if="highScore > 0" :class="styles.highScore">
      High Score: {{ highScore }}
    </div>
  </div>
</template>

<script setup>
import styles from './MainMenu.module.css';
import UIButton from '../ui/UIButton.vue'
defineProps({ highScore: Number })
defineEmits(['start-game', 'show-store'])
</script>
