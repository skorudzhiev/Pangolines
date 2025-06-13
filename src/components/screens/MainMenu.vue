<template>
  <transition name="fade">
    <div :class="styles.menuWrapper" v-if="showMenu">
      <div :class="styles.logoRow">
        <img :class="styles.logo" src="/logo.svg" alt="Pang Logo" />
        <h1>Pang</h1>
      </div>
      <div :class="styles.menuButtons">
        <UIButton @click="showModeScreen = true">Start Game</UIButton>
        <UIButton @click="$emit('show-store')">Store</UIButton>
        <UIButton @click="showSettings = true">Settings</UIButton>
      </div>
      <div v-if="highScore > 0" :class="styles.highScore">
        High Score: {{ highScore }}
      </div>
    </div>
  </transition>
  <GameModeSelectionScreen v-if="showModeScreen" @select-mode="onModeSelected" @back="showModeScreen = false" />
  <SettingsScreen v-if="showSettings" @back="showSettings = false" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import styles from './MainMenu.module.css';
import UIButton from '../ui/UIButton.vue';
import SettingsScreen from './SettingsScreen.vue';
import GameModeSelectionScreen from './GameModeSelectionScreen.vue';

defineProps({ highScore: Number })
defineEmits(['start-game', 'show-store'])

const showSettings = ref(false);
const showModeScreen = ref(false);
const showMenu = ref(false);

function onModeSelected(mode) {
  showModeScreen.value = false;
  emit('start-game', mode === 'classic');
}

onMounted(() => {
  showMenu.value = true;
});
</script>
