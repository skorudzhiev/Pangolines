import { ref, watch } from 'vue';

const musicEnabled = ref(true);
const sfxEnabled = ref(true);

// Load from localStorage initially
const musicKey = 'pangMusicEnabled';
const sfxKey = 'pangSfxEnabled';

if (localStorage.getItem(musicKey) !== null) {
  musicEnabled.value = localStorage.getItem(musicKey) === 'true';
}
if (localStorage.getItem(sfxKey) !== null) {
  sfxEnabled.value = localStorage.getItem(sfxKey) === 'true';
}

watch(musicEnabled, val => {
  localStorage.setItem(musicKey, val);
});
watch(sfxEnabled, val => {
  localStorage.setItem(sfxKey, val);
});

let bgmAudio = null;
const sfxAudios = {};

function loadAudio(src, loop = false) {
  // Support require() or direct string
  let resolvedSrc = src;
  if (src && typeof src === 'object' && src.default) {
    resolvedSrc = src.default;
  }
  const audio = new Audio(resolvedSrc);
  audio.loop = loop;
  audio.preload = 'auto';
  return audio;
}

// Usage: playMusic('relative/path/to/music.mp3')
function playMusic(src) {
  if (!musicEnabled.value) return;
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  }
  bgmAudio = loadAudio(src, true);
  bgmAudio.volume = 0.35;
  bgmAudio.play();
}

function stopMusic() {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  }
}

// Usage: playSfx('relative/path/to/sfx.mp3')
function playSfx(src) {
  if (!sfxEnabled.value) return;
  if (!sfxAudios[src]) {
    sfxAudios[src] = loadAudio(src, false);
  }
  const audio = sfxAudios[src].cloneNode();
  audio.volume = 0.7;
  audio.play();
}

export default function useAudioManager() {
  return {
    musicEnabled,
    sfxEnabled,
    playMusic,
    stopMusic,
    playSfx
  };
}
