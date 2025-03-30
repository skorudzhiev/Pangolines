import { reactive } from "vue";

const store = reactive({
  score: 0,
  powerUps: [
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
  ],
  purchasePowerUp(powerUpId) {
    const powerUp = this.powerUps.find((p) => p.id === powerUpId);
    if (powerUp && this.score >= powerUp.cost && !powerUp.isPurchased) {
      this.score -= powerUp.cost;
      powerUp.isPurchased = true;
      return true; // Purchase successful
    }
    return false; // Purchase failed
  },
  resetPowerUps() {
    this.powerUps.forEach((powerUp) => {
      powerUp.isPurchased = false;
    });
  },
});

export default store;
