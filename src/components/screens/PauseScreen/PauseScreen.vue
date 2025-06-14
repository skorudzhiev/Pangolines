<template>
  <div :class="styles.pauseOverlay">
    <h2>Level Complete!</h2>
    <p>Get ready for the next challenge.</p>
    <div :class="styles.buttonRow">
      <UIButton @click="$emit('next-level')">Next Level</UIButton>
      <UIButton @click="$emit('main-menu')">Main Menu</UIButton>
    </div>
  </div>
</template>

<script setup>
import styles from './PauseScreen.module.css';
import UIButton from '../../ui/UIButton.vue';
defineEmits(['next-level', 'main-menu']);
</script>

<style module>
.pauseOverlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(30, 34, 44, 0.97);
  padding: 38px 36px 28px 36px;
  border-radius: 16px;
  color: #f3f3f3;
  min-width: 340px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.28);
  text-align: center;
  z-index: 40;
}
.buttonRow {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 22px;
}
</style>
