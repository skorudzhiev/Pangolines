<template>
  <div :class="styles.modeScreen">
    <h2>Select Game Mode</h2>
    <div :class="styles.modesList">
      <div
        v-for="mode in modes"
        :key="mode.value"
        :class="[styles.modeCard, selectedMode === mode.value ? styles.selected : '']"
        @click="selectMode(mode.value)"
        tabindex="0"
        role="button"
        :aria-pressed="selectedMode === mode.value"
        @keydown.enter="selectMode(mode.value)"
        @keydown.space.prevent="selectMode(mode.value)"
      >
        <div :class="[styles.icon, styles[mode.value]]"></div>
        <h3>{{ mode.label }}</h3>
        <p>{{ mode.description }}</p>
      </div>
    </div>
    <div class="button-row" style="display: flex; justify-content: center; gap: 18px; margin-top: 18px;">
      <UIButton @click="confirmMode">Start</UIButton>
      <UIButton @click="$emit('back')">Back</UIButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import styles from './GameModeSelectionScreen.module.css';
import UIButton from '../../ui/UIButton.vue';

const emit = defineEmits(['select-mode', 'back'])
const modes = [
  { value: 'arcade', label: 'Arcade', description: 'Modern progression, power-ups, and new challenges.' },
  { value: 'classic', label: 'Classic', description: 'Retro gameplay, original rules.' },
];
const selectedMode = ref('arcade');
function selectMode(mode) {
  selectedMode.value = mode;
}
function confirmMode() {
  emit('select-mode', selectedMode.value);
}
</script>

<style module>
.modeScreen {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(34, 38, 49, 0.97);
  padding: 36px 30px;
  border-radius: 18px;
  color: #f3f3f3;
  min-width: 340px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.28);
  text-align: center;
  z-index: 30;
}
.modes-list {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin: 26px 0 18px 0;
}
.mode-card {
  background: #23233a;
  border-radius: 12px;
  padding: 18px 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border 0.2s;
  border: 2px solid transparent;
  width: 140px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.13);
}
.mode-card.selected {
  border: 2px solid #5ad5fc;
  transform: scale(1.04);
  box-shadow: 0 4px 18px rgba(90,213,252,0.17);
}
.mode-card .icon {
  height: 32px;
  margin-bottom: 8px;
}
.icon.arcade {
  background: url('/assets/icons/arcade.svg') no-repeat center/contain;
}
.icon.classic {
  background: url('/assets/icons/classic.svg') no-repeat center/contain;
}
</style>
