<template>
  <div :class="styles.gameUi">
    <!-- Power-up indicators -->
    <div :class="styles.powerUpIndicators">
      <!-- Shield indicator -->
      <div v-if="store.player && store.player.shieldActive" :class="styles.shieldIndicator">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="18" rx="10" ry="12" fill="#5ad5fc" stroke="#fff" stroke-width="2"/>
          <path d="M16 6 L26 12 L16 28 L6 12 Z" fill="#2b8ab8" stroke="#fff" stroke-width="2"/>
        </svg>
        <span :class="styles.shieldText">Shield Active</span>
      </div>
      
      <!-- Slow Time indicator -->
      <div v-if="timeState && timeState.slowTimeActive" :class="styles.slowTimeIndicator">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" fill="#8b5cf6" stroke="#fff" stroke-width="2"/>
          <path d="M16 8 L16 16 L22 16" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          <circle cx="16" cy="16" r="3" fill="#fff"/>
        </svg>
        <span :class="styles.slowTimeText">Slow Time Active</span>
        <span :class="styles.slowTimeDuration">{{ Math.ceil(timeState.slowTimeDuration / 60) }}s</span>
      </div>
    </div>
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
  difficulty: Number,
  timeState: Object
});

const activePowerUps = computed(() => store.powerUps.filter(p => p.isPurchased));

</script>

<style module>
.shieldIndicator {
  position: absolute;
  top: 16px;
  left: 20px;
  display: flex;
  align-items: center;
  z-index: 20;
  background: rgba(30, 60, 90, 0.8);
  border-radius: 16px;
  padding: 4px 14px 4px 8px;
  box-shadow: 0 2px 12px #5ad5fc33;
  border: 2px solid #5ad5fc;
  animation: shield-pop 0.4s cubic-bezier(.5,1.6,.4,1);
}
.shieldIndicator svg {
  margin-right: 8px;
}
.shieldText {
  color: #5ad5fc;
  font-weight: 700;
  font-size: 1.1em;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 6px #5ad5fc66;
}
@keyframes shield-pop {
  0% { transform: scale(0.92); opacity: 0; }
  80% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
  color: #ffe066;
  font-size: 0.85em;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  border: 1px solid #555;
}

