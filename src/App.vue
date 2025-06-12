<script setup>
import Game from './components/Game.vue'
import './styles/global.css'
</script>

<template>
  <div class="app">
    <h1 class="title">Pang</h1>
    <Game />
  </div>
</template>

<style>
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
