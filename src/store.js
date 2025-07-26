import { reactive, watch } from "vue";
import { saveToLocalStorage, loadFromLocalStorage } from "./utils/helpers";
import { debugMode } from "./composables/useDebugMode";

// Default power-up definitions (for validation and fallback)
const defaultPowerUps = [
  {
    id: 'fasterMovement',
    name: 'Faster Movement',
    description: 'Increases player movement speed',
    cost: 250,
    isPurchased: false,
  },
  {
    id: 'largerShots',
    name: 'Larger Shots',
    description: 'Increases the size of projectiles',
    cost: 600,
    isPurchased: false,
  },
  {
    id: 'explosiveProjectiles',
    name: 'Explosive Projectiles',
    description: 'Projectiles explode on impact',
    cost: 750,
    isPurchased: false,
  },
  {
    id: 'doubleProjectiles',
    name: 'Double Projectiles',
    description: 'Can fire two projectiles, one at a time',
    cost: 650,
    isPurchased: false,
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Provides temporary protection from bubbles. Activate in-game with the S key.',
    cost: 900,
    isPurchased: false,
  },
  {
    id: 'slowTime',
    name: 'Slow Time',
    description: 'Slows down bubble movement for easier targeting. Activate in-game with the T key.',
    cost: 950,
    isPurchased: false,
  },
  {
    id: 'multiShot',
    name: 'Multi-Shot',
    description: 'Fires multiple projectiles in a spread pattern',
    cost: 800,
    isPurchased: false,
  },
  {
    id: 'homingProjectiles',
    name: 'Homing Projectiles',
    description: 'Projectiles automatically seek nearby bubbles',
    cost: 850,
    isPurchased: false,
  },
  {
    id: 'rapidFire',
    name: 'Rapid Fire',
    description: 'Significantly increases firing rate',
    cost: 850,
    isPurchased: false,
  },
  {
    id: 'anchorShot',
    name: 'Anchor Shot',
    description: 'Fires an anchor that remains until it is hit by a bubble',
    cost: 900,
    isPurchased: false,
  },

  {
    id: 'extraLife',
    name: 'Extra Life',
    description: 'Grants one additional life when purchased',
    cost: 1000,
    isPurchased: false,
  },
];

function validateLoadedStoreState(loaded) {
  // Validate score
  let score = 0;
  if (typeof loaded?.score === 'number' && loaded.score >= 0) {
    score = loaded.score;
  }
  // Validate powerUps
  let powerUps = defaultPowerUps
  .filter(def => def.id !== 'magneticCollect')
  .map(def => {
    const match = loaded?.powerUps?.find(p => p.id === def.id);
    return {
      ...def,
      isPurchased: !!match?.isPurchased
    };
  });
  return { score, powerUps };
}

const loaded = loadFromLocalStorage('pangStoreState', null);
const { score, powerUps } = validateLoadedStoreState(loaded);


const store = reactive({
  score,
  powerUps,
  purchasePowerUp(powerUpId) {
    const powerUp = this.powerUps.find((p) => p.id === powerUpId);
    // In debug mode, allow free purchases
    if (powerUp && !powerUp.isPurchased && (debugMode.value || this.score >= powerUp.cost)) {
      if (!debugMode.value) {
        this.score -= powerUp.cost;
      }
      powerUp.isPurchased = true;
      console.log(`Power-up '${powerUp.name}' purchased${debugMode ? ' (DEBUG MODE - FREE)' : ''}`);
      return true;
    }
    return false;
  },
  extraLifeJustUsed: false,
  playerInvincibleUntil: 0,
  resetPowerUps() {
    this.powerUps.forEach((powerUp) => {
      // Only reset extraLife if it was not just used (i.e., game over not triggered by extra life usage)
      if (powerUp.id === 'extraLife') {
        if (!this.extraLifeJustUsed) {
          powerUp.isPurchased = false;
        }
      } else {
        powerUp.isPurchased = false;
      }
    });
    this.extraLifeJustUsed = false;
    saveToLocalStorage('pangStoreState', { score: this.score, powerUps: this.powerUps });
  },
});

// Watch for changes to score or powerUps and persist automatically
watch(
  () => [store.score, store.powerUps.map(p => p.isPurchased)],
  () => {
    saveToLocalStorage('pangStoreState', { score: store.score, powerUps: store.powerUps });
  },
  { deep: true }
);

export default store;
