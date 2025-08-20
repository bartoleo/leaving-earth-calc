<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { store } from '../store.js';

const audioVolume = ref(store.audioVolume);

watch(audioVolume, (newValue, oldValue) => {
  store.setValues({
    audioVolume: newValue,
  });
});

const exit = (players) => {
  if (store.mass != 0) {
    window.location.hash = '/game';
  } else {
    window.location.hash = '/';
  }
};

</script>

<template>
  <nav class="navbar sticky-top bg-dark">
    <div class="container-fluid">
        <span class="fs-4 text-light">Leaving Earth - Calc</span>
    </div>
  </nav>

  <div class="card">
    <div class="card-body new-game-info" >
      Settings
    </div> 
  </div>

  <div>
    <div>
      <label for="audioVolume">Sound effects volume</label>
    </div>
    <div>
      <input class="audioVolume-slider" type="range" id="audioVolume" name="audioVolume"
      v-model="audioVolume" 
      min="0" max="1" step="0.05" >
    </div>
  </div>


  <div class="setup-buttons">
    <button class="btn btn-primary" type="button" @click="exit()">Ok</button>
  </div>

</template>

<style scoped>

</style>
