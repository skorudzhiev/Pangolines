<template>
  <div class="store-container">
    <h2>Power-Ups Store</h2>
    <div class="score-display">Score: {{ score }}</div>
    <div class="powerups-container">
      <div v-for="powerUp in powerUps" :key="powerUp.id" class="powerup-item">
        <h3>{{ powerUp.name }}</h3>
        <p>{{ powerUp.description }}</p>
        <p>Cost: {{ powerUp.cost }}</p>
        <UIButton @click="$emit('purchase', powerUp.id)" :disabled="score < powerUp.cost || powerUp.isPurchased">
          {{ powerUp.isPurchased ? 'Purchased' : 'Buy Now' }}
        </UIButton>
      </div>
    </div>
    <UIButton class="back-button" @click="$emit('close-store')">Back to Main Menu</UIButton>
  </div>
</template>

<script setup>
import UIButton from '../ui/UIButton.vue'
defineProps({ score: Number, powerUps: Array })
defineEmits(['purchase', 'close-store'])
</script>
