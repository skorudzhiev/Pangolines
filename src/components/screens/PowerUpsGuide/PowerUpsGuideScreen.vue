<template>
  <div :class="styles.guideContainer">
    <div :class="styles.header">
      <div :class="styles.headerTop">
        <UIButton :class="styles.headerBackButton" @click="$emit('back')">
          ← Back to Menu
        </UIButton>
        <h2>Power-Ups Guide</h2>
        <div></div> <!-- Spacer for centering -->
      </div>
      <p :class="styles.subtitle">Master the art of bubble destruction with strategic power-up combinations</p>
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
          {{ category.name }}
        </UIButton>
      </div>

      <!-- Power-Ups by Category -->
      <div v-if="activeCategory === 'all'" :class="styles.section">
        <h3>All Power-Ups ({{ props.powerUps.length }} available)</h3>
        <div :class="styles.powerupsGrid">
          <div v-for="powerUp in props.powerUps" :key="powerUp.id" :class="styles.powerupCard">
            <div :class="styles.powerupHeader">
              <h4>{{ powerUp.name }}</h4>
              <span :class="[styles.cost, getCostClass(powerUp.cost)]">{{ powerUp.cost }} pts</span>
            </div>
            <p :class="styles.description">{{ powerUp.description }}</p>
            <div :class="styles.tags">
              <span v-for="tag in getPowerUpTags(powerUp)" :key="tag" :class="styles.tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Offensive Power-Ups -->
      <div v-if="activeCategory === 'offensive'" :class="styles.section">
        <h3>🔥 Offensive Power-Ups</h3>
        <p :class="styles.categoryDesc">Enhance your firepower and projectile capabilities</p>
        <div :class="styles.powerupsGrid">
          <div v-for="powerUp in offensivePowerUps" :key="powerUp.id" :class="styles.powerupCard">
            <div :class="styles.powerupHeader">
              <h4>{{ powerUp.name }}</h4>
              <span :class="[styles.cost, getCostClass(powerUp.cost)]">{{ powerUp.cost }} pts</span>
            </div>
            <p :class="styles.description">{{ powerUp.description }}</p>
            <div :class="styles.effectiveness">
              <strong>Best for:</strong> {{ getEffectiveness(powerUp.id) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Defensive Power-Ups -->
      <div v-if="activeCategory === 'defensive'" :class="styles.section">
        <h3>🛡️ Defensive Power-Ups</h3>
        <p :class="styles.categoryDesc">Protect yourself and control the battlefield</p>
        <div :class="styles.powerupsGrid">
          <div v-for="powerUp in defensivePowerUps" :key="powerUp.id" :class="styles.powerupCard">
            <div :class="styles.powerupHeader">
              <h4>{{ powerUp.name }}</h4>
              <span :class="[styles.cost, getCostClass(powerUp.cost)]">{{ powerUp.cost }} pts</span>
            </div>
            <p :class="styles.description">{{ powerUp.description }}</p>
            <div :class="styles.effectiveness">
              <strong>Best for:</strong> {{ getEffectiveness(powerUp.id) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Utility Power-Ups -->
      <div v-if="activeCategory === 'utility'" :class="styles.section">
        <h3>⚡ Utility Power-Ups</h3>
        <p :class="styles.categoryDesc">Movement and special abilities</p>
        <div :class="styles.powerupsGrid">
          <div v-for="powerUp in utilityPowerUps" :key="powerUp.id" :class="styles.powerupCard">
            <div :class="styles.powerupHeader">
              <h4>{{ powerUp.name }}</h4>
              <span :class="[styles.cost, getCostClass(powerUp.cost)]">{{ powerUp.cost }} pts</span>
            </div>
            <p :class="styles.description">{{ powerUp.description }}</p>
            <div :class="styles.effectiveness">
              <strong>Best for:</strong> {{ getEffectiveness(powerUp.id) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Combinations -->
      <div v-if="activeCategory === 'combinations'" :class="styles.section">
        <h3>💫 Powerful Combinations</h3>
        <p :class="styles.categoryDesc">Synergistic power-up combinations for maximum effectiveness</p>
        <div :class="styles.combinationsGrid">
          <div v-for="combo in powerUpCombinations" :key="combo.id" :class="styles.comboCard">
            <h4>{{ combo.name }}</h4>
            <div :class="styles.comboPowerUps">
              <span v-for="powerUp in combo.powerUps" :key="powerUp" :class="styles.comboPowerUp">
                {{ getPowerUpName(powerUp) }}
              </span>
            </div>
            <p :class="styles.comboDescription">{{ combo.description }}</p>
            <div :class="styles.comboStats">
              <span :class="styles.difficulty">{{ combo.difficulty }}</span>
              <span :class="styles.totalCost">Total: {{ combo.totalCost }} pts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Strategy Tips -->
      <div v-if="activeCategory === 'strategy'" :class="styles.section">
        <h3>🎯 Strategy & Tips</h3>
        <div :class="styles.tipsGrid">
          <div v-for="tip in strategyTips" :key="tip.id" :class="styles.tipCard">
            <h4>{{ tip.title }}</h4>
            <p>{{ tip.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import styles from './PowerUpsGuideScreen.module.css';
import UIButton from '../../ui/UIButton.vue';

const props = defineProps({
  powerUps: {
    type: Array,
    default: () => []
  }
});

// Debug logging
onMounted(() => {
  console.log('Power-Ups Guide - Received power-ups:', props.powerUps);
  console.log('Power-Ups Guide - Count:', props.powerUps.length);
});

defineEmits(['back']);

const activeCategory = ref('all');

const categories = [
  { id: 'all', name: 'All' },
  { id: 'offensive', name: 'Offensive' },
  { id: 'defensive', name: 'Defensive' },
  { id: 'utility', name: 'Utility' },
  { id: 'combinations', name: 'Combinations' },
  { id: 'strategy', name: 'Strategy' }
];

const offensivePowerUps = computed(() => {
  const offensiveIds = ['largerShots', 'explosiveProjectiles', 'doubleProjectiles', 'multiShot', 'homingProjectiles', 'rapidFire', 'anchorShot'];
  return props.powerUps.filter(p => offensiveIds.includes(p.id));
});

const defensivePowerUps = computed(() => {
  const defensiveIds = ['shield', 'slowTime', 'extraLife'];
  return props.powerUps.filter(p => defensiveIds.includes(p.id));
});

const utilityPowerUps = computed(() => {
  const utilityIds = ['fasterMovement'];
  return props.powerUps.filter(p => utilityIds.includes(p.id));
});

const powerUpCombinations = [
  {
    id: 'sniper',
    name: '🎯 The Sniper',
    powerUps: ['largerShots', 'slowTime'],
    description: 'Perfect for precise shots. Slow time to line up your shots, then use larger projectiles for guaranteed hits.',
    difficulty: 'Beginner',
    totalCost: 1400
  },
  {
    id: 'machineGun',
    name: '🔫 Machine Gun',
    powerUps: ['rapidFire', 'multiShot'],
    description: 'Overwhelming firepower. Rapid fire combined with multi-shot creates a wall of projectiles.',
    difficulty: 'Intermediate',
    totalCost: 1400
  },
  {
    id: 'smartBomber',
    name: '🧠 Smart Bomber',
    powerUps: ['homingProjectiles', 'explosiveProjectiles'],
    description: 'Set and forget destruction. Homing projectiles that explode on impact for maximum area damage.',
    difficulty: 'Advanced',
    totalCost: 1700
  },
  {
    id: 'fortress',
    name: '🏰 The Fortress',
    powerUps: ['shield', 'extraLife', 'slowTime'],
    description: 'Ultimate survival build. Maximum protection with time control for defensive play.',
    difficulty: 'Expert',
    totalCost: 2900
  },
  {
    id: 'speedDemon',
    name: '⚡ Speed Demon',
    powerUps: ['fasterMovement', 'rapidFire', 'doubleProjectiles'],
    description: 'High-mobility offense. Move fast, shoot fast, and overwhelm with projectile count.',
    difficulty: 'Intermediate',
    totalCost: 1550
  },
  {
    id: 'anchorMaster',
    name: '⚓ Anchor Master',
    powerUps: ['anchorShot', 'shield', 'fasterMovement'],
    description: 'Strategic positioning. Use anchors for area control while staying mobile and protected.',
    difficulty: 'Advanced',
    totalCost: 1950
  }
];

const strategyTips = [
  {
    id: 'early',
    title: 'Early Game Strategy',
    content: 'Start with Faster Movement (300 pts) for better positioning, then save for Larger Shots (500 pts) to improve accuracy.'
  },
  {
    id: 'mid',
    title: 'Mid Game Power Spikes',
    content: 'Explosive Projectiles (700 pts) or Double Projectiles (600 pts) provide significant damage increases. Choose based on your playstyle.'
  },
  {
    id: 'late',
    title: 'Late Game Dominance',
    content: 'Homing Projectiles (1000 pts) are game-changing. Combine with any explosive or multi-shot power-up for devastating results.'
  },
  {
    id: 'defensive',
    title: 'When to Go Defensive',
    content: 'If you\'re struggling with survival, prioritize Shield (800 pts) and Slow Time (900 pts) before investing in offense.'
  },
  {
    id: 'anchor',
    title: 'Anchor Shot Tactics',
    content: 'Place anchors in narrow passages or corners where bubbles frequently pass. They act as persistent damage sources.'
  },
  {
    id: 'economy',
    title: 'Point Economy',
    content: 'Don\'t spend all points immediately. Save for powerful combinations rather than buying every cheap upgrade.'
  }
];

function getCostClass(cost) {
  if (cost <= 400) return 'cheap';
  if (cost <= 700) return 'moderate';
  if (cost <= 1000) return 'expensive';
  return 'premium';
}

function getPowerUpTags(powerUp) {
  const tags = [];
  if (powerUp.cost <= 400) tags.push('Budget');
  if (powerUp.cost >= 1000) tags.push('Premium');
  if (['rapidFire', 'multiShot', 'doubleProjectiles'].includes(powerUp.id)) tags.push('High DPS');
  if (['shield', 'extraLife', 'slowTime'].includes(powerUp.id)) tags.push('Survival');
  if (['homingProjectiles', 'explosiveProjectiles'].includes(powerUp.id)) tags.push('Smart');
  if (['fasterMovement'].includes(powerUp.id)) tags.push('Mobility');
  return tags;
}

function getEffectiveness(powerUpId) {
  const effectiveness = {
    'fasterMovement': 'Dodging bubbles and repositioning quickly',
    'largerShots': 'Players who struggle with accuracy',
    'explosiveProjectiles': 'Clearing multiple bubbles efficiently',
    'doubleProjectiles': 'Consistent damage output',
    'shield': 'Emergency protection in tight situations',
    'slowTime': 'Precise aiming and overwhelming scenarios',
    'multiShot': 'Area coverage and crowd control',
    'homingProjectiles': 'Effortless targeting and hard-to-reach bubbles',
    'rapidFire': 'Aggressive players who like constant action',
    'anchorShot': 'Strategic players who plan ahead',
    'extraLife': 'Extending gameplay and learning opportunities'
  };
  return effectiveness[powerUpId] || 'General gameplay improvement';
}

function getPowerUpName(powerUpId) {
  const powerUp = props.powerUps.find(p => p.id === powerUpId);
  return powerUp ? powerUp.name : powerUpId;
}
</script>
