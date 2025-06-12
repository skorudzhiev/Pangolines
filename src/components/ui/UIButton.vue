<template>
  <button class="ui-button" :disabled="disabled" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<script setup>
defineProps({ disabled: Boolean });
defineEmits(['click']);
</script>

<style scoped>
.ui-button {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  background: #42b883;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin: 4px 0;
  transition: background 0.2s;
}
.ui-button:disabled {
  background: #aaa;
  cursor: not-allowed;
}
.ui-button:not(:disabled):hover {
  background: #339966;
}
</style>
