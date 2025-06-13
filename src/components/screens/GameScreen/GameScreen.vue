<template>
  <div :class="styles.gameUi">
    <div :class="styles.scoreContainer">
      <Score>Score: {{ score }}</Score>

      <div :class="[styles.comboDisplay, { [styles.comboDisplayActive]: comboCounter > 0 }]">
        <span :class="styles.comboCounter">{{ comboCounter }}x Combo</span>
        <span :class="styles.comboMultiplier">{{ comboMultiplier.toFixed(1) }}x Multiplier</span>
      </div>

    </div>
    <div v-if="classicMode" :class="styles.levelDisplay">Level: {{ currentLevel }}</div>
    <div v-else :class="styles.difficultyDisplay">Difficulty: {{ Math.floor(difficulty * 10) / 10 }}</div>
  </div>
</template>

<script setup>
import styles from './GameScreen.module.css';
import { computed } from 'vue';
import Score from '../../ui/Score.vue';
import store from '../../../store.js';

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
  color: #ffe066;
  font-size: 0.85em;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  border: 1px solid #555;
}

