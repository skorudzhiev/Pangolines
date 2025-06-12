<template>
  <div class="store-container">
    <h2>Power-Ups Store</h2>
    <div class="score-display">Score: {{ score }}</div>
    <div class="powerups-container">
      <div v-for="powerUp in powerUps" :key="powerUp.id" class="powerup-item">
        <h3>{{ powerUp.name }}</h3>
        <p>{{ powerUp.description }}</p>
        <p>Cost: {{ powerUp.cost }}</p>
        <button @click="$emit('purchase', powerUp.id)" :disabled="score < powerUp.cost || powerUp.isPurchased">
          {{ powerUp.isPurchased ? 'Purchased' : 'Buy Now' }}
        </button>
      </div>
    </div>
    <button class="back-button" @click="$emit('close-store')">Back to Main Menu</button>
  </div>
</template>

<script setup>
defineProps({ score: Number, powerUps: Array })
defineEmits(['purchase', 'close-store'])
</script>
