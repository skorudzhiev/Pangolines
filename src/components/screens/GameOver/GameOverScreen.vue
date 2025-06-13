<template>
  <div :class="styles.gameOver">
    <h1>Game Over</h1>
    <div :class="styles.scoreDisplay">Score: {{ score }}</div>
    <div v-if="highScore > 0" :class="styles.highScore">High Score: {{ highScore }}</div>
    <UIButton @click="$emit('play-again')">Play Again</UIButton>
  </div>
</template>

<script setup>
import styles from './GameOverScreen.module.css';
import UIButton from '../../ui/UIButton.vue'
defineProps({ score: Number, highScore: Number })
defineEmits(['play-again'])
</script>
