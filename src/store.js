import { reactive, watch } from "vue";
import { saveToLocalStorage, loadFromLocalStorage } from "./utils/helpers";

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
    if (powerUp && this.score >= powerUp.cost && !powerUp.isPurchased) {
      this.score -= powerUp.cost;
      // Mutate in-place for reactivity
      powerUp.isPurchased = true;
      // Vue 3 reactivity: force update if needed
      const idx = this.powerUps.findIndex(p => p.id === powerUpId);
      if (idx !== -1) this.powerUps[idx] = { ...powerUp };
      saveToLocalStorage('pangStoreState', { score: this.score, powerUps: this.powerUps });
      console.log('[STORE] Power-up purchased:', powerUpId, this.powerUps);
      return true; // Purchase successful
    }
    return false; // Purchase failed
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
