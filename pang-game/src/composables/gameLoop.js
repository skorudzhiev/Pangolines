import { ref } from 'vue';

export function useGameLoop() {
  const animationFrameId = ref(null);

  const stopGameLoop = () => {
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
  };

  const startGameLoop = (updateFunction) => {
    stopGameLoop();

    const animate = () => {
      updateFunction();
      animationFrameId.value = requestAnimationFrame(animate);
    };

    animationFrameId.value = requestAnimationFrame(animate);
  };

  return {
    startGameLoop,
    stopGameLoop
  };
}
