<script setup>
import Game from './components/Game.vue'
</script>

<template>
  <div class="app">
    <h1 class="title">Pang</h1>
    <Game />
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #121212;
  color: white;
  font-family: Arial, sans-serif;
}

.app {
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  color: #42b883;
  margin-bottom: 20px;
}
</style>
