<template>
  <button class="ui-button" :disabled="disabled" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<script setup>
defineProps({ disabled: Boolean });
defineEmits(['click']);
</script>


