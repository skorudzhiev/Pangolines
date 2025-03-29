import { ref } from 'vue';

export function useGameLoop() {
  const animationFrameId = ref(null);
  
  const startGameLoop = (updateFunction) => {
    const animate = () => {
      updateFunction();
      animationFrameId.value = requestAnimationFrame(animate);
    };
    
    animationFrameId.value = requestAnimationFrame(animate);
  };
  
  const stopGameLoop = () => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
  };
  
  return {
    startGameLoop,
    stopGameLoop
  };
}
