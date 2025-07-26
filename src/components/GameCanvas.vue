<template>
  <div class="canvas-wrapper" ref="canvasWrapper">
    <canvas ref="gameCanvas" :width="gameWidth" :height="gameHeight"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

// Props
const props = defineProps({
  gameWidth: {
    type: Number,
    required: true
  },
  gameHeight: {
    type: Number,
    required: true
  },
  gameRunning: {
    type: Boolean,
    required: true
  },
  onUpdate: {
    type: Function,
    required: true
  }
});

const canvasWrapper = ref(null);
const gameCanvas = ref(null);
let ctx = null;

const updateCanvasScale = () => {
  if (!canvasWrapper.value) return;
  const container = canvasWrapper.value.parentElement.getBoundingClientRect();
  const scaleToFit = Math.min(
    container.width / props.gameWidth,
    container.height / props.gameHeight
  ) * 0.95;
  const newWidth = props.gameWidth * scaleToFit;
  const newHeight = props.gameHeight * scaleToFit;
  const left = (container.width - newWidth) / 2;
  const top = (container.height - newHeight) / 2;
  Object.assign(canvasWrapper.value.style, {
    transform: `scale(${scaleToFit})`,
    transformOrigin: 'top left',
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: `${props.gameWidth}px`,
    height: `${props.gameHeight}px`
  });
};

const handleResize = () => {
  updateCanvasScale();
  if (ctx) {
    ctx.clearRect(0, 0, props.gameWidth, props.gameHeight);
  }
};

onMounted(() => {
  if (gameCanvas.value) {
    ctx = gameCanvas.value.getContext('2d');
    updateCanvasScale();
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

watch(() => props.gameRunning, (running) => {
  if (running && ctx) {
    // Start continuous game loop
    const animate = () => {
      if (props.gameRunning) {
        props.onUpdate(ctx);
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
});

// Expose refs for parent
defineExpose({
  canvasWrapper,
  gameCanvas
});
</script>

<style scoped>
.canvas-wrapper {
  position: relative;
  width: 1024px;
  height: 768px;
  transform-origin: center center;
  will-change: transform;
  flex-shrink: 0;
}

canvas {
  display: block;
  background-color: #1f2937;
  width: 100%;
  height: 100%;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
