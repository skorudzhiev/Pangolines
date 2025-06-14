import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import useAudioManager from './composables/useAudioManager';

const app = createApp(App);

// Play background music on mount
app.mixin({
  mounted() {
    if (typeof window !== 'undefined' && this.$root === this) {
      const { playMusic, musicEnabled } = useAudioManager();
      if (musicEnabled.value) {
        playMusic('assets/audio/bgm.mp3');
      }
    }
  }
});

app.mount('#app');
