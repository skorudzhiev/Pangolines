<template>
  <transition name="fade">
    <div :class="styles.menuWrapper" v-if="showMenu && !showModeScreen && !showPowerUpsGuide && !showSettings">
      <div :class="styles.logoRow">
        <img :class="styles.logo" src="/logo.svg" alt="Pang Logo" />
        <h1>Pangolines</h1>
      </div>
      <div :class="styles.menuButtons">
        <UIButton @click="showModeScreen = true">Start Game</UIButton>
        <UIButton @click="$emit('show-store')">Store</UIButton>
        <UIButton @click="showPowerUpsGuide = true">Power-Ups Guide</UIButton>
        <UIButton @click="showSettings = true">Settings</UIButton>
      </div>
      <div v-if="highScore > 0" :class="styles.highScore">
        High Score: {{ highScore }}
      </div>
    </div>
  </transition>
  <GameModeSelectionScreen v-if="showModeScreen" @select-mode="onModeSelected" @back="showModeScreen = false" />
  <PowerUpsGuideScreen v-if="showPowerUpsGuide" :powerUps="powerUps" @back="showPowerUpsGuide = false" />
  <SettingsScreen v-if="showSettings" @back="showSettings = false" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import styles from './MainMenu.module.css';
import UIButton from '../../ui/UIButton.vue';
import SettingsScreen from '../Settings/SettingsScreen.vue';
import GameModeSelectionScreen from '../GameModeSelection/GameModeSelectionScreen.vue';
import PowerUpsGuideScreen from '../PowerUpsGuide/PowerUpsGuideScreen.vue';

defineProps({ 
  highScore: Number,
  powerUps: Array
})
const emit = defineEmits(['start-game', 'show-store'])

const showSettings = ref(false);
const showModeScreen = ref(false);
const showPowerUpsGuide = ref(false);
const showMenu = ref(false);

function onModeSelected(mode) {
  showModeScreen.value = false;
  emit('start-game', mode === 'classic');
}

onMounted(() => {
  showMenu.value = true;
});
</script>
