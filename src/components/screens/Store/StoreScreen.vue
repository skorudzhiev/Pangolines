<template>
  <div :class="styles.storeContainer">
    <h2>Power-Ups Store</h2>
    <div :class="styles.scoreDisplay">Score: {{ score }}</div>
    <div :class="styles.powerupsContainer">
      <div v-for="powerUp in powerUps" :key="powerUp.id" :class="styles.powerupItem">
        <h3>{{ powerUp.name }}</h3>
        <p>{{ powerUp.description }}</p>
        <p>Cost: {{ powerUp.cost }}</p>
        <UIButton @click="$emit('purchase', powerUp.id)" :disabled="score < powerUp.cost || powerUp.isPurchased">
          {{ powerUp.isPurchased ? 'Purchased' : 'Buy Now' }}
        </UIButton>
      </div>
    </div>
    <UIButton :class="styles.backButton" @click="$emit('close-store')">Back to Main Menu</UIButton>
  </div>
</template>

<script setup>
import styles from './StoreScreen.module.css';
import UIButton from '../../ui/UIButton.vue'
defineProps({ score: Number, powerUps: Array })
defineEmits(['purchase', 'close-store'])
</script>
