<template>
  <div :class="styles.settingsScreen">
    <h2>Settings</h2>
    <div class="settings-group">
      <label>
        <span>Music</span>
        <input type="checkbox" v-model="musicEnabled" />
      </label>
      <label>
        <span>Sound Effects</span>
        <input type="checkbox" v-model="sfxEnabled" />
      </label>
    </div>
    <div class="settings-group">
      <label>
        <span>Controls</span>
        <select v-model="controlScheme">
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
        </select>
      </label>
    </div>
    <UIButton @click="$emit('back')">Back</UIButton>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import styles from './SettingsScreen.module.css';
import UIButton from '../ui/UIButton.vue';

defineEmits(['back'])
const musicEnabled = ref(true);
const sfxEnabled = ref(true);
const controlScheme = ref('classic');
</script>

<style module>
.settingsScreen {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(30, 30, 40, 0.95);
  padding: 32px 28px;
  border-radius: 16px;
  color: #f3f3f3;
  min-width: 320px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  text-align: center;
  z-index: 30;
}
.settings-group {
  margin: 18px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
label span {
  margin-right: 12px;
}
select {
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  background: #23233a;
  color: #fff;
}
input[type="checkbox"] {
  accent-color: #5ad5fc;
  width: 18px;
  height: 18px;
}
</style>
