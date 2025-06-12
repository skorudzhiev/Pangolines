import { reactive, onMounted, onUnmounted } from 'vue';

/**
 * useInput composable for keyboard (and future gamepad) input handling
 * Exposes a reactive key state and setup/teardown for event listeners
 */
export function useInput() {
  // Track key states
  const keysPressed = reactive({
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    // Add more keys as needed
  });

  // Input buffer for smoother gameplay (future: can expand)
  const inputBuffer = [];

  // Keyboard event handlers
  const handleKeyDown = (e) => {
    if (e.code === 'ArrowLeft') keysPressed.ArrowLeft = true;
    if (e.code === 'ArrowRight') keysPressed.ArrowRight = true;
    if (e.code === 'Space') {
      keysPressed.Space = true;
      // Optionally buffer actions here
      inputBuffer.push({ type: 'fire', timestamp: Date.now() });
    }
    // Prevent scrolling for game keys
    if ([
      'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
    ].includes(e.code)) {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === 'ArrowLeft') keysPressed.ArrowLeft = false;
    if (e.code === 'ArrowRight') keysPressed.ArrowRight = false;
    if (e.code === 'Space') keysPressed.Space = false;
    e.preventDefault();
  };

  // Placeholder for gamepad support
  const handleGamepad = () => {
    // Future: implement gamepad polling and map to keysPressed
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // Future: add gamepad polling
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    // Future: remove gamepad polling
  });

  return {
    keysPressed,
    inputBuffer, // Expose for future use
    handleKeyDown,
    handleKeyUp,
    // handleGamepad (for future)
  };
}
