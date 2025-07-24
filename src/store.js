import { reactive, watch } from "vue";
import { saveToLocalStorage, loadFromLocalStorage } from "./utils/helpers";
import { debugMode } from "./composables/useDebugMode";

// Default power-up definitions (for validation and fallback)
const defaultPowerUps = [
  {
    id: 'fasterMovement',
    name: 'Faster Movement',
    description: 'Increases player movement speed',
    cost: 300,
    isPurchased: false,
  },
  {
    id: 'largerShots',
    name: 'Larger Shots',
    description: 'Increases the size of projectiles',
    cost: 500,
    isPurchased: false,
  },
  {
    id: 'explosiveProjectiles',
    name: 'Explosive Projectiles',
    description: 'Projectiles explode on impact',
    cost: 700,
    isPurchased: false,
  },
  {
    id: 'doubleProjectiles',
    name: 'Double Projectiles',
    description: 'Can fire two projectiles, one at a time',
    cost: 600,
    isPurchased: false,
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Provides temporary protection from bubbles',
    cost: 800,
    isPurchased: false,
  },
  {
    id: 'slowTime',
    name: 'Slow Time',
    description: 'Slows down bubble movement for easier targeting',
    cost: 900,
    isPurchased: false,
  },
  {
    id: 'multiShot',
    name: 'Multi-Shot',
    description: 'Fires multiple projectiles in a spread pattern',
    cost: 750,
    isPurchased: false,
  },
  {
    id: 'homingProjectiles',
    name: 'Homing Projectiles',
    description: 'Projectiles automatically seek nearby bubbles',
    cost: 1000,
    isPurchased: false,
  },
  {
    id: 'rapidFire',
    name: 'Rapid Fire',
    description: 'Significantly increases firing rate',
    cost: 650,
    isPurchased: false,
  },
  {
    id: 'piercing',
    name: 'Piercing Shots',
    description: 'Projectiles can pass through multiple bubbles',
    cost: 850,
    isPurchased: false,
  },
  {
    id: 'magneticCollect',
    name: 'Magnetic Collector',
    description: 'Automatically attracts score pickups from distance',
    cost: 550,
    isPurchased: false,
  },
  {
    id: 'extraLife',
    name: 'Extra Life',
    description: 'Grants one additional life when purchased',
    cost: 1200,
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
  let powerUps = defaultPowerUps.map(def => {
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
  resetPowerUps() {
    this.powerUps.forEach((powerUp) => {
      powerUp.isPurchased = false;
    });
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
