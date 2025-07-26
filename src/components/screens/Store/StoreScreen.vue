<template>
  <div :class="styles.storeContainer">
    <div :class="styles.header">
      <div :class="styles.headerTop">
        <UIButton :class="styles.headerBackButton" @click="$emit('close-store')">
          ← Back to Menu
        </UIButton>
        <h2>Power-Ups Store</h2>
        <div :class="styles.scoreDisplay">
          <span :class="styles.scoreLabel">Your Points</span>
          <span :class="styles.scoreValue">{{ score.toLocaleString() }}</span>
        </div>
      </div>
      <p :class="styles.subtitle">Enhance your arsenal with powerful upgrades</p>
    </div>
    
    <div :class="styles.content">
      <!-- Quick Navigation -->
      <div :class="styles.navigation">
        <UIButton 
          v-for="category in categories" 
          :key="category.id"
          @click="activeCategory = category.id"
          :class="[styles.navButton, { [styles.active]: activeCategory === category.id }]"
        >
          {{ category.name }} ({{ getCategoryCount(category.id) }})
        </UIButton>
      </div>

      <!-- Store Stats -->
      <div :class="styles.statsSection">
        <div :class="styles.statCard">
          <span :class="styles.statValue">{{ purchasedCount }}</span>
          <span :class="styles.statLabel">Owned</span>
        </div>
        <div :class="styles.statCard">
          <span :class="styles.statValue">{{ availableCount }}</span>
          <span :class="styles.statLabel">Available</span>
        </div>
        <div :class="styles.statCard">
          <span :class="styles.statValue">{{ affordableCount }}</span>
          <span :class="styles.statLabel">Affordable</span>
        </div>
      </div>

      <!-- Power-Ups Grid -->
      <div :class="styles.section">
        <h3 v-if="activeCategory === 'all'">All Power-Ups ({{ filteredPowerUps.length }} items)</h3>
        <h3 v-else-if="activeCategory === 'affordable'">💰 Affordable Power-Ups</h3>
        <h3 v-else-if="activeCategory === 'owned'">✅ Owned Power-Ups</h3>
        <h3 v-else-if="activeCategory === 'available'">🛒 Available Power-Ups</h3>
        
        <div :class="styles.powerupsGrid">
          <div v-for="powerUp in filteredPowerUps" :key="powerUp.id" :class="styles.powerupCard">
            <div :class="styles.powerupHeader">
              <h4>{{ powerUp.name }}</h4>
              <div :class="styles.powerupStatus">
                <span :class="[styles.cost, getCostClass(powerUp.cost, powerUp.isPurchased)]">
                  {{ powerUp.cost.toLocaleString() }} pts
                </span>
                <span v-if="powerUp.isPurchased" :class="styles.ownedBadge">✓ Owned</span>
                <span v-else-if="!canAfford(powerUp)" :class="styles.unaffordableBadge">💸 Need {{ (powerUp.cost - score).toLocaleString() }} more</span>
              </div>
            </div>
            <p :class="styles.description">{{ powerUp.description }}</p>
            <div :class="styles.tags">
              <span v-for="tag in getPowerUpTags(powerUp)" :key="tag" :class="styles.tag">
                {{ tag }}
              </span>
            </div>
            <div :class="styles.powerupActions">
              <UIButton 
                @click="$emit('purchase', powerUp.id)" 
                :disabled="powerUp.isPurchased || (!debugMode && !canAfford(powerUp))"
                :class="[styles.purchaseButton, {
                  [styles.purchased]: powerUp.isPurchased,
                  [styles.affordable]: !powerUp.isPurchased && canAfford(powerUp),
                  [styles.unaffordable]: !powerUp.isPurchased && !canAfford(powerUp)
                }]"
              >
                <span v-if="powerUp.isPurchased">✓ Purchased</span>
                <span v-else-if="canAfford(powerUp)">💰 Buy Now</span>
                <span v-else>🔒 Not Enough Points</span>
              </UIButton>
            </div>
          </div>
        </div>
        
        <div v-if="filteredPowerUps.length === 0" :class="styles.emptyState">
          <p>{{ getEmptyStateMessage() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import styles from './StoreScreen.module.css';
import UIButton from '../../ui/UIButton.vue'
import { debugMode, isDebugAvailable } from '../../../composables/useDebugMode';

const props = defineProps({ score: Number, powerUps: Array })
defineEmits(['purchase', 'close-store'])

// Active category for navigation
const activeCategory = ref('all');

// Categories for navigation
const categories = [
  { id: 'all', name: 'All' },
  { id: 'affordable', name: 'Affordable' },
  { id: 'available', name: 'Available' },
  { id: 'owned', name: 'Owned' }
];

// Computed properties for stats
const purchasedCount = computed(() => 
  props.powerUps.filter(p => p.isPurchased).length
);

const availableCount = computed(() => 
  props.powerUps.filter(p => !p.isPurchased).length
);

const affordableCount = computed(() => 
  props.powerUps.filter(p => !p.isPurchased && canAfford(p)).length
);

// Filtered power-ups based on active category
const filteredPowerUps = computed(() => {
  switch (activeCategory.value) {
    case 'affordable':
      return props.powerUps.filter(p => !p.isPurchased && canAfford(p));
    case 'available':
      return props.powerUps.filter(p => !p.isPurchased);
    case 'owned':
      return props.powerUps.filter(p => p.isPurchased);
    default:
      return props.powerUps;
  }
});

// Helper functions
const canAfford = (powerUp) => {
  return debugMode.value || props.score >= powerUp.cost;
};

const getCostClass = (cost, isPurchased) => {
  if (isPurchased) return 'purchased';
  if (cost <= 300) return 'cheap';
  if (cost <= 600) return 'moderate';
  if (cost <= 900) return 'expensive';
  return 'premium';
};

const getPowerUpTags = (powerUp) => {
  const tags = [];
  
  // Cost-based tags
  if (powerUp.cost <= 300) tags.push('Budget');
  else if (powerUp.cost <= 600) tags.push('Standard');
  else if (powerUp.cost <= 900) tags.push('Premium');
  else tags.push('Elite');
  
  // Type-based tags
  if (powerUp.name.toLowerCase().includes('shot') || 
      powerUp.name.toLowerCase().includes('projectile') ||
      powerUp.name.toLowerCase().includes('fire')) {
    tags.push('Offensive');
  }
  
  if (powerUp.name.toLowerCase().includes('shield') ||
      powerUp.name.toLowerCase().includes('life') ||
      powerUp.name.toLowerCase().includes('slow')) {
    tags.push('Defensive');
  }
  
  if (powerUp.name.toLowerCase().includes('movement') ||
      powerUp.name.toLowerCase().includes('magnetic') ||
      powerUp.name.toLowerCase().includes('anchor')) {
    tags.push('Utility');
  }
  
  // Special tags
  if (powerUp.cost >= 1000) tags.push('Game Changer');
  if (powerUp.isPurchased) tags.push('Owned');
  
  return tags;
};

const getCategoryCount = (categoryId) => {
  switch (categoryId) {
    case 'affordable':
      return affordableCount.value;
    case 'available':
      return availableCount.value;
    case 'owned':
      return purchasedCount.value;
    default:
      return props.powerUps.length;
  }
};

const getEmptyStateMessage = () => {
  switch (activeCategory.value) {
    case 'affordable':
      return 'No power-ups you can currently afford. Keep playing to earn more points!';
    case 'available':
      return 'All power-ups have been purchased! You\'re fully equipped.';
    case 'owned':
      return 'You haven\'t purchased any power-ups yet. Start building your arsenal!';
    default:
      return 'No power-ups available.';
  }
};
</script>
