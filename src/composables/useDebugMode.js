import { ref } from 'vue';

// Global debug state - persists across all components and screens
export const debugMode = ref(false);
const debugToggleBuffer = ref([]);

export function toggleDebugMode() {
  debugMode.value = !debugMode.value;
  console.log(`Debug mode ${debugMode.value ? 'enabled' : 'disabled'}`);
}

export function processDebugInput(inputBuffer) {
  const debugToggles = inputBuffer.filter(input => input.type === 'toggleDebug');
  debugToggles.forEach(toggle => {
    if (!debugToggleBuffer.value.includes(toggle.timestamp)) {
      debugToggleBuffer.value.push(toggle.timestamp);
      toggleDebugMode();
      if (debugToggleBuffer.value.length > 10) {
        debugToggleBuffer.value = debugToggleBuffer.value.slice(-10);
      }
    }
  });
}

export function getDebugIndicator() {
  return {
    visible: debugMode.value,
    text: 'DEBUG MODE',
    style: {
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(255, 0, 0, 0.8)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 9999,
      border: '1px solid #ff0000',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }
  };
}

  

